import { Router } from 'express';
import { SchemeController } from '../controllers/SchemeController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.get('/list', SchemeController.listSchemes);

// Admin only: create a new scheme
router.post(
  '/create',
  authenticate,
  authorize('admin'),
  validateBody(['title', 'description', 'benefits', 'deadline', 'category']),
  SchemeController.createScheme
);

export default router;
