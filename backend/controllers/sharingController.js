import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ShareLink from '../models/ShareLink.js';
import Record from '../models/Record.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Log action helper
const logAction = async (action, userId, details, req) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  if (global.isMockDB) {
    global.mockAuditLogs.unshift({
      _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      userId,
      details,
      ipAddress,
      userAgent,
      createdAt: new Date()
    });
  } else {
    try {
      await AuditLog.create({ action, userId, details, ipAddress, userAgent });
    } catch (error) {
      console.error('Audit logging failed', error);
    }
  }
};

/**
 * @desc    Create a secure sharing link
 * @route   POST /api/sharing/create
 * @access  Private
 */
export const createShareLink = async (req, res) => {
  const { recordIds, doctorEmail, expiresHours, passcode } = req.body;
  
  if (!recordIds || recordIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Select at least one record to share' });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + Number(expiresHours || 24));
    
    // Generate unique sharing code
    const sharingCode = crypto.randomBytes(16).toString('hex');
    
    let passcodeHash = null;
    if (passcode) {
      passcodeHash = await bcrypt.hash(passcode, 10);
    }

    let doctorId = null;
    if (doctorEmail) {
      if (global.isMockDB) {
        const docObj = global.mockUsers.find(u => u.email === doctorEmail && u.role === 'Doctor');
        if (docObj) doctorId = docObj._id;
      } else {
        const docObj = await User.findOne({ email: doctorEmail, role: 'Doctor' });
        if (docObj) doctorId = docObj._id;
      }
    }

    let newShare;
    
    if (global.isMockDB) {
      newShare = {
        _id: `share_${Date.now()}`,
        recordIds,
        patientId: req.user._id,
        doctorId,
        doctorEmail: doctorEmail || 'Open Link',
        expiresAt,
        passcodeHash,
        sharingCode,
        accessLogs: [],
        createdAt: new Date()
      };
      global.mockShareLinks.push(newShare);
    } else {
      newShare = await ShareLink.create({
        recordIds,
        patientId: req.user._id,
        doctorId,
        doctorEmail: doctorEmail || 'Open Link',
        expiresAt,
        passcodeHash,
        sharingCode
      });
    }

    await logAction('RECORD_SHARE', req.user._id, `Created secure sharing link for ${recordIds.length} records. Shared with: ${doctorEmail || 'Any (Passcode-Protected)'}`, req);

    res.status(201).json({
      success: true,
      share: {
        _id: newShare._id,
        sharingCode: newShare.sharingCode,
        expiresAt: newShare.expiresAt,
        doctorEmail: newShare.doctorEmail
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get shared records (doctor portal access)
 * @route   POST /api/sharing/access/:code
 * @access  Public
 */
export const getSharedRecords = async (req, res) => {
  const { code } = req.params;
  const { passcode } = req.body;
  
  try {
    let share;
    if (global.isMockDB) {
      share = global.mockShareLinks.find(s => s.sharingCode === code);
    } else {
      share = await ShareLink.findOne({ sharingCode: code });
    }

    if (!share) {
      return res.status(404).json({ success: false, message: 'Invalid sharing code or link revoked' });
    }

    // Check expiration
    if (new Date() > new Date(share.expiresAt)) {
      return res.status(410).json({ success: false, message: 'This sharing link has expired' });
    }

    // Passcode validation
    if (share.passcodeHash) {
      if (!passcode) {
        return res.status(200).json({ success: true, requirePasscode: true });
      }
      
      const isMatch = await bcrypt.compare(passcode, share.passcodeHash);
      if (!isMatch) {
        // Log failed access
        const log = { timestamp: new Date(), ip: req.ip, userAgent: req.headers['user-agent'], success: false };
        share.accessLogs.push(log);
        if (!global.isMockDB) await share.save();
        return res.status(401).json({ success: false, message: 'Invalid passcode' });
      }
    }

    // Log successful access
    const log = { timestamp: new Date(), ip: req.ip, userAgent: req.headers['user-agent'], success: true };
    share.accessLogs.push(log);
    
    let patient;
    let records = [];

    if (global.isMockDB) {
      patient = global.mockUsers.find(u => u._id.toString() === share.patientId.toString());
      records = global.mockRecords.filter(r => share.recordIds.includes(r._id));
    } else {
      await share.save();
      patient = await User.findById(share.patientId).select('name email bloodGroup allergies medicalConditions emergencyContact');
      records = await Record.find({ _id: { $in: share.recordIds } });
    }

    await logAction('SHARE_ACCESS', share.patientId, `Doctor accessed records via sharing code ${code}. Success: true`, req);

    res.json({
      success: true,
      patient: {
        name: patient?.name,
        bloodGroup: patient?.bloodGroup,
        allergies: patient?.allergies,
        medicalConditions: patient?.medicalConditions,
        emergencyContact: patient?.emergencyContact
      },
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get patient active sharing links
 * @route   GET /api/sharing/active
 * @access  Private
 */
export const getPatientShares = async (req, res) => {
  try {
    if (global.isMockDB) {
      const shares = global.mockShareLinks.filter(s => s.patientId.toString() === req.user._id.toString());
      return res.json({ success: true, shares });
    }
    
    const shares = await ShareLink.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Revoke a sharing link
 * @route   DELETE /api/sharing/:id
 * @access  Private
 */
export const revokeShareLink = async (req, res) => {
  const shareId = req.params.id;

  try {
    let share;
    if (global.isMockDB) {
      const idx = global.mockShareLinks.findIndex(s => s._id === shareId);
      if (idx !== -1) {
        share = global.mockShareLinks[idx];
        global.mockShareLinks.splice(idx, 1);
      }
    } else {
      share = await ShareLink.findById(shareId);
      if (share) {
        await ShareLink.deleteOne({ _id: shareId });
      }
    }

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share link not found' });
    }

    if (share.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await logAction('RECORD_SHARE', req.user._id, `Revoked secure sharing link: code ${share.sharingCode}`, req);

    res.json({ success: true, message: 'Sharing link revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
