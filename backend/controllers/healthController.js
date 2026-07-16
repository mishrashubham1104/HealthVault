import Visit from '../models/Visit.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all doctor visits for user
 * @route   GET /api/health/visits
 * @access  Private
 */
export const getVisits = async (req, res) => {
  try {
    if (global.isMockDB) {
      const visits = global.mockVisits.filter(v => v.userId.toString() === req.user._id.toString());
      visits.sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.json({ success: true, count: visits.length, visits });
    }
    
    const visits = await Visit.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ success: true, count: visits.length, visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a doctor visit record
 * @route   POST /api/health/visits
 * @access  Private
 */
export const createVisit = async (req, res) => {
  const { doctorName, specialty, date, notes, diagnosis, prescriptions } = req.body;
  
  if (!doctorName || !specialty) {
    return res.status(400).json({ success: false, message: 'Please provide Doctor Name and Specialty' });
  }

  try {
    let newVisit;
    
    if (global.isMockDB) {
      newVisit = {
        _id: `vis_${Date.now()}`,
        doctorName,
        specialty,
        date: date ? new Date(date) : new Date(),
        notes: notes || '',
        diagnosis: diagnosis || '',
        prescriptions: prescriptions || [],
        userId: req.user._id,
        createdAt: new Date()
      };
      global.mockVisits.push(newVisit);
    } else {
      newVisit = await Visit.create({
        doctorName,
        specialty,
        date: date ? new Date(date) : new Date(),
        notes,
        diagnosis,
        prescriptions,
        userId: req.user._id
      });
    }

    res.status(201).json({ success: true, visit: newVisit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user security audit logs
 * @route   GET /api/health/audit-logs
 * @access  Private
 */
export const getAuditLogs = async (req, res) => {
  try {
    if (global.isMockDB) {
      const logs = global.mockAuditLogs.filter(l => l.userId?.toString() === req.user._id.toString());
      return res.json({ success: true, logs });
    }
    
    const logs = await AuditLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
