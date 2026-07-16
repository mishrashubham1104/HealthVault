import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., "1 pill", "5ml"
  time: { type: String, required: true },   // e.g., "08:00", "20:30"
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'As Needed'],
    default: 'Daily'
  },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
  timestamps: true
});

const Reminder = mongoose.model('Reminder', ReminderSchema);
export default Reminder;
