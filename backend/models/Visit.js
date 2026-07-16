import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true }, // e.g., "Cardiologist", "GP"
  date: { type: Date, default: Date.now },
  notes: { type: String },
  diagnosis: { type: String },
  prescriptions: [{ type: String }], // List of drugs prescribed during this visit
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
  timestamps: true
});

const Visit = mongoose.model('Visit', VisitSchema);
export default Visit;
