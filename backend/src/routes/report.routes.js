import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import {
  createReport,
  getReports,
  getReportById,
  deleteReport,
  downloadPdf,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { analyzeLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

router.use(protect);

router.post('/', analyzeLimiter, createReport);
router.get('/', getReports);
router.get('/:id', param('id').isMongoId(), validate, getReportById);
router.delete('/:id', param('id').isMongoId(), validate, deleteReport);
router.get('/:id/pdf', param('id').isMongoId(), validate, downloadPdf);

export default router;
