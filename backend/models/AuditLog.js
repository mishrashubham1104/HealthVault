import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'REGISTER', '2FA_VERIFY', 'RECORD_VIEW', 'RECORD_UPLOAD', 'RECORD_DOWNLOAD', 'RECORD_DELETE', 'RECORD_SHARE', 'SHARE_ACCESS'],
    required: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  details: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
