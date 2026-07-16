import fs from 'fs';
import path from 'path';
import Record from '../models/Record.js';
import AuditLog from '../models/AuditLog.js';
import { saveAndEncryptFile, readAndDecryptFile } from '../middleware/upload.js';

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

// High-fidelity AI Explainer Mock
const getAIExplanation = (category, title, description) => {
  const normalizedTitle = (title + ' ' + description).toLowerCase();
  
  if (category === 'Blood Test') {
    if (normalizedTitle.includes('lipid') || normalizedTitle.includes('cholesterol')) {
      return `### AI Lab Report Summary (Lipid Panel)
- **Total Cholesterol**: 240 mg/dL (Elevated, target is < 200 mg/dL).
- **HDL (Good Cholesterol)**: 38 mg/dL (Borderline low, target is > 40 mg/dL).
- **LDL (Bad Cholesterol)**: 162 mg/dL (High, target is < 100 mg/dL).
- **Triglycerides**: 200 mg/dL (Borderline high, target is < 150 mg/dL).

**Clinical Interpretation**: 
Your lipid panel shows hypercholesterolemia, primarily driven by high LDL levels. This indicates moderate plaque buildup risk. 
**Next Steps**:
1. Reduce intake of saturated and trans fats. Increase dietary soluble fiber (oats, beans).
2. Engage in 30 minutes of aerobic exercise 4-5 times a week to boost HDL.
3. Schedule a follow-up with your primary physician to discuss if statin therapy is recommended.`;
    }
    
    if (normalizedTitle.includes('diabetes') || normalizedTitle.includes('sugar') || normalizedTitle.includes('glucose') || normalizedTitle.includes('hba1c')) {
      return `### AI Lab Report Summary (Glycemic Panel)
- **HbA1c**: 6.8% (Elevated, indicating Type 2 Diabetes range).
- **Fasting Blood Glucose**: 136 mg/dL (Elevated, diabetic range).

**Clinical Interpretation**:
Both your HbA1c and fasting blood glucose levels indicate Type 2 Diabetes. The HbA1c level reflects an average blood sugar control over the past 2-3 months.
**Next Steps**:
1. Monitor carbohydrate intake and space meals evenly.
2. Meet with a certified diabetes educator or nutritionist.
3. Consult a doctor for starting glucose-lowering therapy (e.g., Metformin) and setting up a monitoring schedule.`;
    }
    
    return `### AI Lab Report Summary (Complete Blood Count & Basic Metabolic)
- **Hemoglobin**: 14.2 g/dL (Normal).
- **White Blood Cell (WBC) Count**: 7.2 x10^3/µL (Normal, no active infection detected).
- **Platelets**: 250 x10^3/µL (Normal).
- **Kidney Function (e.g. Creatinine)**: 0.9 mg/dL (Normal filtration).

**Clinical Interpretation**:
All major markers in this routine blood panel are within their standard reference ranges. No critical inflammatory, hematological, or metabolic abnormalities were found.
**Next Steps**:
Maintain your current healthy lifestyle and continue with regular annual checkups.`;
  }
  
  if (category === 'Thyroid') {
    return `### AI Lab Report Summary (Thyroid Panel)
- **TSH (Thyroid Stimulating Hormone)**: 6.2 µIU/mL (High, reference range 0.4 - 4.0).
- **Free T4**: 0.8 ng/dL (Borderline low).

**Clinical Interpretation**:
An elevated TSH combined with low-normal T4 indicates Mild (Subclinical) Hypothyroidism. Your pituitary gland is releasing more TSH to stimulate an underactive thyroid.
**Next Steps**:
1. Consult your endocrinologist.
2. Consider checking for thyroid antibodies (TPO) to screen for Hashimoto's Thyroiditis.
3. Discuss if low-dose levothyroxine is needed based on symptoms (fatigue, weight gain, cold sensitivity).`;
  }
  
  if (category === 'Liver' || category === 'Kidney') {
    return `### AI Lab Report Summary (Organ Function Panel)
- **ALT / AST (Liver Enzymes)**: 34 / 28 U/L (Normal range, no hepatic injury indicated).
- **Bilirubin**: 0.8 mg/dL (Normal).
- **eGFR (Kidney Filtration)**: 92 mL/min/1.73m² (Normal kidney function, Stage 1).

**Clinical Interpretation**:
The metabolic markers show normal liver enzyme levels and healthy kidney filtration rates. Organs are functioning well.
**Next Steps**:
Maintain proper hydration and limit alcohol intake.`;
  }
  
  if (['MRI', 'CT Scan', 'X-Ray'].includes(category)) {
    return `### AI Imaging Analysis Summary
- **Imaging Modality**: ${category}
- **Region**: Chest / Spine (Simulated Region)
- **Findings**: Lungs are clear. Heart size is normal. Minimal degenerative osteophytic spurring noted along the lumbar spine vertebrae. No acute skeletal fractures or herniations visualized.

**Clinical Interpretation**:
Routine imaging report. The primary organs and structures imaged show no acute, life-threatening pathologies or major fractures. Minor degenerative wear and tear compatible with age.
**Next Steps**:
Discuss the detailed radiologist impressions with the ordering physician for diagnostic correlation.`;
  }
  
  return `### AI Summary Explanation
- **Document Title**: ${title}
- **Identified Category**: ${category}

**Clinical Analysis**:
This health document has been securely processed. Based on initial text indexing, it contains standard patient diagnostics and general clinical records. No immediate critical alerts are flagged.
**Recommendation**:
Please upload a detailed PDF or consult your doctor to interpret specific clinical values and long-term health trends.`;
};

// High-fidelity OCR prescription mock
const getOCRTextMock = (filename) => {
  const fileLower = filename.toLowerCase();
  
  if (fileLower.includes('cough') || fileLower.includes('cold') || fileLower.includes('flu')) {
    return `PRESCRIPTION - CLINICAL CARE CLINIC
Date: 2026-06-05
Patient: John Doe

Rx:
1. Amoxicillin 500mg
   Dosage: 1 Capsule
   Frequency: Three times daily
   Duration: 7 days
   Instructions: Take with food. Complete the full course.
   
2. Benadryl Cough Syrup 10ml
   Dosage: 10ml
   Frequency: As needed (every 6 hours)
   Instructions: May cause drowsiness. Avoid driving.
   
Refills: 0
Signed: Dr. Sarah Jenkins, MD`;
  }

  if (fileLower.includes('bp') || fileLower.includes('hypertension') || fileLower.includes('heart')) {
    return `CARDIOVASCULAR HEALTH CENTER
Date: 2026-05-12

Rx:
1. Lisinopril 10mg
   Dosage: 1 Tablet
   Frequency: Once daily
   Instructions: Take in the morning. Monitor blood pressure weekly.
   
2. Atorvastatin 20mg
   Dosage: 1 Tablet
   Frequency: Once daily (at bedtime)
   Instructions: Avoid grapefruit juice.
   
Refills: 3
Signed: Dr. Alan Mercer, FACC`;
  }

  return `HEALTH SERVICES MEDICAL CENTER
Date: 2026-06-08

Rx:
1. Metformin 500mg ER
   Dosage: 1 Tablet
   Frequency: Twice daily
   Instructions: Take with morning and evening meals.
   
2. Multivitamin Tablets
   Dosage: 1 Tablet
   Frequency: Once daily
   Instructions: Take with breakfast.
   
Signed: Dr. Emily Roberts, MD`;
};

/**
 * @desc    Upload a new medical record
 * @route   POST /api/records/upload
 * @access  Private
 */
export const uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, category, description, date, provider, policyNumber, coverageAmount, startDate, endDate } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and Category are required' });
    }

    // Save and encrypt the file on the server
    const encryptedPath = saveAndEncryptFile(req.file.buffer, req.file.originalname);
    
    // Simulate OCR and AI Analysis
    const ocrText = getOCRTextMock(req.file.originalname);
    const aiExplanation = getAIExplanation(category, title, description || '');

    let newRecord;
    
    if (global.isMockDB) {
      newRecord = {
        _id: `rec_${Date.now()}`,
        title,
        category,
        fileUrl: encryptedPath,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        patientId: req.user._id,
        uploadedBy: req.user._id,
        date: date ? new Date(date) : new Date(),
        description: description || '',
        ocrText: category === 'Prescription' ? ocrText : '',
        aiExplanation: aiExplanation,
        createdAt: new Date()
      };
      
      if (category === 'Insurance') {
        newRecord.insuranceDetails = {
          provider,
          policyNumber,
          coverageAmount: Number(coverageAmount || 0),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        };
      }
      
      global.mockRecords.push(newRecord);
    } else {
      const recordData = {
        title,
        category,
        fileUrl: encryptedPath,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        patientId: req.user._id,
        uploadedBy: req.user._id,
        date: date ? new Date(date) : new Date(),
        description: description || '',
        ocrText: category === 'Prescription' ? ocrText : '',
        aiExplanation: aiExplanation
      };

      if (category === 'Insurance') {
        recordData.insuranceDetails = {
          provider,
          policyNumber,
          coverageAmount: Number(coverageAmount || 0),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        };
      }

      newRecord = await Record.create(recordData);
    }

    await logAction('RECORD_UPLOAD', req.user._id, `Uploaded and encrypted record: "${title}" (${category})`, req);
    
    res.status(201).json({
      success: true,
      message: 'File uploaded and encrypted successfully',
      record: newRecord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user medical records (with advanced filters)
 * @route   GET /api/records
 * @access  Private
 */
export const getRecords = async (req, res) => {
  const { category, search, patientId } = req.query;
  const activePatientId = patientId || req.user._id;

  try {
    if (global.isMockDB) {
      let filtered = global.mockRecords.filter(r => r.patientId.toString() === activePatientId.toString());
      
      if (category) {
        filtered = filtered.filter(r => r.category === category);
      }
      
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(query) || 
          r.description.toLowerCase().includes(query)
        );
      }
      
      // Sort by date descending
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return res.json({ success: true, count: filtered.length, records: filtered });
    }

    const queryObj = { patientId: activePatientId };
    
    if (category) {
      queryObj.category = category;
    }
    
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await Record.find(queryObj).sort({ date: -1 });
    
    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get individual decrypted record file stream
 * @route   GET /api/records/:id/download
 * @access  Private
 */
export const downloadRecordFile = async (req, res) => {
  const recordId = req.params.id;
  
  try {
    let record;
    if (global.isMockDB) {
      record = global.mockRecords.find(r => r._id === recordId);
    } else {
      record = await Record.findById(recordId);
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Role check: patient can view own, doctor can view if shared (handled in sharing logic)
    if (record.patientId.toString() !== req.user._id.toString() && req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this health record' });
    }

    // Decrypt file on-the-fly
    const decryptedBuffer = readAndDecryptFile(record.fileUrl);
    
    await logAction('RECORD_DOWNLOAD', req.user._id, `Downloaded decrypted record: "${record.title}"`, req);

    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${record.fileName || 'record'}"`);
    res.send(decryptedBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a medical record
 * @route   DELETE /api/records/:id
 * @access  Private
 */
export const deleteRecord = async (req, res) => {
  const recordId = req.params.id;
  
  try {
    let record;
    if (global.isMockDB) {
      const idx = global.mockRecords.findIndex(r => r._id === recordId);
      if (idx !== -1) {
        record = global.mockRecords[idx];
        global.mockRecords.splice(idx, 1);
      }
    } else {
      record = await Record.findById(recordId);
      if (record) {
        await Record.deleteOne({ _id: recordId });
      }
    }

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (record.patientId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    // Delete local file
    if (fs.existsSync(record.fileUrl)) {
      fs.unlinkSync(record.fileUrl);
    }

    await logAction('RECORD_DELETE', req.user._id, `Deleted health record: "${record.title}"`, req);

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
