import mongoose from 'mongoose';

const AccessLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true }
});

const ShareLinkSchema = new mongoose.Schema({
  recordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true }],
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Optional, can be shared with a specific doctor or open-link
  doctorEmail: { type: String }, // To show who it was shared with
  expiresAt: { type: Date, required: true },
  passcodeHash: { type: String }, // Optional PIN code protection
  sharingCode: { type: String, required: true, unique: true, index: true }, // Random hash/string for URL slug
  accessLogs: [AccessLogSchema]
}, {
  timestamps: true
});

// Check if link is expired
ShareLinkSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

const ShareLink = mongoose.model('ShareLink', ShareLinkSchema);
export default ShareLink;
