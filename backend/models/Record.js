import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Blood Test', 'Liver', 'Kidney', 'Thyroid', 'MRI', 'CT Scan', 'X-Ray', 'Prescription', 'Vaccination', 'Insurance'],
    required: true
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  mimeType: { type: String },
  encryptionKey: { type: String }, // Stores encrypted key used for AES file encryption
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  description: { type: String },
  ocrText: { type: String },
  aiExplanation: { type: String },
  insuranceDetails: {
    provider: { type: String },
    policyNumber: { type: String },
    coverageAmount: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date }
  }
}, {
  timestamps: true
});

const Record = mongoose.model('Record', RecordSchema);
export default Record;
