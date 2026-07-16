import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String },
  allergies: { type: String, default: 'None' }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Admin'], default: 'Patient' },
  bloodGroup: { type: String },
  age: { type: Number },
  photo: { type: String },
  medicalConditions: [{ type: String }],
  allergies: { type: String, default: 'None' },
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  familyMembers: [FamilyMemberSchema],
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
