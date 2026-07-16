import Reminder from '../models/Reminder.js';

/**
 * @desc    Create a medicine reminder
 * @route   POST /api/reminders
 * @access  Private
 */
export const createReminder = async (req, res) => {
  const { title, dosage, time, frequency } = req.body;
  
  if (!title || !dosage || !time) {
    return res.status(400).json({ success: false, message: 'Please provide Title, Dosage, and Time' });
  }

  try {
    let newReminder;
    
    if (global.isMockDB) {
      newReminder = {
        _id: `rem_${Date.now()}`,
        title,
        dosage,
        time,
        frequency: frequency || 'Daily',
        isActive: true,
        userId: req.user._id,
        createdAt: new Date()
      };
      global.mockReminders.push(newReminder);
    } else {
      newReminder = await Reminder.create({
        title,
        dosage,
        time,
        frequency: frequency || 'Daily',
        userId: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      reminder: newReminder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user medicine reminders
 * @route   GET /api/reminders
 * @access  Private
 */
export const getReminders = async (req, res) => {
  try {
    if (global.isMockDB) {
      const reminders = global.mockReminders.filter(r => r.userId.toString() === req.user._id.toString());
      return res.json({ success: true, count: reminders.length, reminders });
    }

    const reminders = await Reminder.find({ userId: req.user._id }).sort({ time: 1 });
    res.json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update a medicine reminder
 * @route   PUT /api/reminders/:id
 * @access  Private
 */
export const updateReminder = async (req, res) => {
  const reminderId = req.params.id;
  const { title, dosage, time, frequency, isActive } = req.body;

  try {
    let updated;
    
    if (global.isMockDB) {
      const idx = global.mockReminders.findIndex(r => r._id === reminderId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }
      
      if (global.mockReminders[idx].userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      
      updated = {
        ...global.mockReminders[idx],
        title: title !== undefined ? title : global.mockReminders[idx].title,
        dosage: dosage !== undefined ? dosage : global.mockReminders[idx].dosage,
        time: time !== undefined ? time : global.mockReminders[idx].time,
        frequency: frequency !== undefined ? frequency : global.mockReminders[idx].frequency,
        isActive: isActive !== undefined ? isActive : global.mockReminders[idx].isActive
      };
      
      global.mockReminders[idx] = updated;
    } else {
      let reminder = await Reminder.findById(reminderId);
      if (!reminder) {
        return res.status(404).json({ success: false, message: 'Reminder not found' });
      }
      
      if (reminder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      
      if (title !== undefined) reminder.title = title;
      if (dosage !== undefined) reminder.dosage = dosage;
      if (time !== undefined) reminder.time = time;
      if (frequency !== undefined) reminder.frequency = frequency;
      if (isActive !== undefined) reminder.isActive = isActive;
      
      updated = await reminder.save();
    }

    res.json({
      success: true,
      reminder: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a medicine reminder
 * @route   DELETE /api/reminders/:id
 * @access  Private
 */
export const deleteReminder = async (req, res) => {
  const reminderId = req.params.id;

  try {
    let deleted = false;
    
    if (global.isMockDB) {
      const idx = global.mockReminders.findIndex(r => r._id === reminderId);
      if (idx !== -1) {
        if (global.mockReminders[idx].userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        global.mockReminders.splice(idx, 1);
        deleted = true;
      }
    } else {
      const reminder = await Reminder.findById(reminderId);
      if (reminder) {
        if (reminder.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await Reminder.deleteOne({ _id: reminderId });
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
