import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'healthvaultjwtsecretkeychangeinproduction99', {
    expiresIn: '30d'
  });
};

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
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    if (global.isMockDB) {
      const exists = global.mockUsers.some(u => u.email === email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: role || 'Patient',
        familyMembers: [],
        medicalConditions: [],
        allergies: 'None',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt: new Date()
      };
      
      global.mockUsers.push(newUser);
      
      await logAction('REGISTER', newUser._id, `Registered account with email: ${email}`, req);
      
      const userResponse = { ...newUser };
      delete userResponse.password;
      delete userResponse.twoFactorSecret;
      
      return res.status(201).json({
        success: true,
        token: generateToken(newUser._id),
        user: userResponse
      });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Patient'
    });
    
    await logAction('REGISTER', user._id, `Registered account with email: ${email}`, req);
    
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyMembers: user.familyMembers,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password, token2fa } = req.body;
  
  try {
    if (global.isMockDB) {
      const user = global.mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // If 2FA is enabled
      if (user.twoFactorEnabled) {
        if (!token2fa) {
          return res.status(200).json({
            success: true,
            require2fa: true,
            message: 'Two-Factor Authentication is required'
          });
        }
        
        const verified = authenticator.verify({
          token: token2fa,
          secret: user.twoFactorSecret
        });
        
        if (!verified) {
          return res.status(401).json({ success: false, message: 'Invalid 2FA token' });
        }
        await logAction('2FA_VERIFY', user._id, 'Successfully completed 2FA login verification', req);
      }
      
      await logAction('LOGIN', user._id, 'User logged in successfully', req);
      
      const userResponse = { ...user };
      delete userResponse.password;
      delete userResponse.twoFactorSecret;
      
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: userResponse
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!token2fa) {
        return res.status(200).json({
          success: true,
          require2fa: true,
          message: 'Two-Factor Authentication is required'
        });
      }
      
      const verified = authenticator.verify({
        token: token2fa,
        secret: user.twoFactorSecret
      });
      
      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      }
      await logAction('2FA_VERIFY', user._id, 'Successfully completed 2FA login verification', req);
    }
    
    await logAction('LOGIN', user._id, 'User logged in successfully', req);
    
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyMembers: user.familyMembers,
        twoFactorEnabled: user.twoFactorEnabled,
        bloodGroup: user.bloodGroup,
        age: user.age,
        photo: user.photo,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

/**
 * @desc    Update user profile & family members
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  const { name, bloodGroup, allergies, emergencyContact, familyMembers, medicalConditions, age, photo } = req.body;
  
  try {
    if (global.isMockDB) {
      const idx = global.mockUsers.findIndex(u => u._id === req.user._id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const updatedUser = {
        ...global.mockUsers[idx],
        name: name !== undefined ? name : global.mockUsers[idx].name,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : global.mockUsers[idx].bloodGroup,
        age: age !== undefined ? age : global.mockUsers[idx].age,
        photo: photo !== undefined ? photo : global.mockUsers[idx].photo,
        allergies: allergies !== undefined ? allergies : global.mockUsers[idx].allergies,
        medicalConditions: medicalConditions !== undefined ? medicalConditions : global.mockUsers[idx].medicalConditions,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : global.mockUsers[idx].emergencyContact,
        familyMembers: familyMembers !== undefined ? familyMembers : global.mockUsers[idx].familyMembers
      };
      
      global.mockUsers[idx] = updatedUser;
      
      const userResponse = { ...updatedUser };
      delete userResponse.password;
      delete userResponse.twoFactorSecret;
      
      return res.json({ success: true, user: userResponse });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (name !== undefined) user.name = name;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (age !== undefined) user.age = age;
    if (photo !== undefined) user.photo = photo;
    if (allergies !== undefined) user.allergies = allergies;
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (familyMembers !== undefined) user.familyMembers = familyMembers;
    
    const updatedUser = await user.save();
    
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        familyMembers: updatedUser.familyMembers,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        bloodGroup: updatedUser.bloodGroup,
        age: updatedUser.age,
        photo: updatedUser.photo,
        allergies: updatedUser.allergies,
        medicalConditions: updatedUser.medicalConditions,
        emergencyContact: updatedUser.emergencyContact
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate 2FA Secret & QR Code
 * @route   POST /api/auth/2fa/setup
 * @access  Private
 */
export const setup2FA = async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const appName = process.env.TWO_FACTOR_APP_NAME || 'HealthVault';
    const otpauthUrl = authenticator.keyuri(req.user.email, appName, secret);
    
    // Save temporary secret to user (not yet enabled until validated)
    if (global.isMockDB) {
      const idx = global.mockUsers.findIndex(u => u._id === req.user._id);
      global.mockUsers[idx].twoFactorSecret = secret;
    } else {
      await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret });
    }
    
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    
    res.json({
      success: true,
      secret,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify 2FA token & enable
 * @route   POST /api/auth/2fa/verify
 * @access  Private
 */
export const verify2FA = async (req, res) => {
  const { token } = req.body;
  
  try {
    let secret = req.user.twoFactorSecret;
    if (!secret) {
      return res.status(400).json({ success: false, message: '2FA has not been setup yet' });
    }
    
    const verified = authenticator.verify({ token, secret });
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid token, verification failed' });
    }
    
    if (global.isMockDB) {
      const idx = global.mockUsers.findIndex(u => u._id === req.user._id);
      global.mockUsers[idx].twoFactorEnabled = true;
    } else {
      await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    }
    
    await logAction('2FA_VERIFY', req.user._id, 'Two-Factor Authentication successfully enabled', req);
    
    res.json({
      success: true,
      message: 'Two-Factor Authentication successfully enabled'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Disable 2FA
 * @route   POST /api/auth/2fa/disable
 * @access  Private
 */
export const disable2FA = async (req, res) => {
  try {
    if (global.isMockDB) {
      const idx = global.mockUsers.findIndex(u => u._id === req.user._id);
      global.mockUsers[idx].twoFactorEnabled = false;
      global.mockUsers[idx].twoFactorSecret = null;
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
    }
    
    await logAction('2FA_VERIFY', req.user._id, 'Two-Factor Authentication successfully disabled', req);
    
    res.json({
      success: true,
      message: 'Two-Factor Authentication successfully disabled'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get public emergency profile
 * @route   GET /api/auth/emergency-profile/:id
 * @access  Public
 */
export const getEmergencyProfile = async (req, res) => {
  const { id } = req.params;
  try {
    if (global.isMockDB) {
      const user = global.mockUsers.find(u => u._id.toString() === id.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({
        success: true,
        profile: {
          name: user.name,
          age: user.age,
          photo: user.photo,
          bloodGroup: user.bloodGroup,
          allergies: user.allergies,
          medicalConditions: user.medicalConditions,
          emergencyContact: user.emergencyContact
        }
      });
    }

    const user = await User.findById(id).select('name age photo bloodGroup allergies medicalConditions emergencyContact');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  try {
    if (global.isMockDB) {
      const idx = global.mockUsers.findIndex(u => u._id === req.user._id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = global.mockUsers[idx];
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      global.mockUsers[idx].password = hashedNewPassword;
      
      await logAction('PASSWORD_CHANGE', user._id, 'Password changed successfully', req);
      return res.json({ success: true, message: 'Password changed successfully' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    await logAction('PASSWORD_CHANGE', user._id, 'Password changed successfully', req);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
