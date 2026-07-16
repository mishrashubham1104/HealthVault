import express from 'express';
import {
  uploadRecord,
  getRecords,
  downloadRecordFile,
  deleteRecord
} from '../controllers/recordController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/', protect, getRecords);
router.get('/:id/download', protect, downloadRecordFile);
router.delete('/:id', protect, deleteRecord);

export default router;
