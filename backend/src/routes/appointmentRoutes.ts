import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Allow all users to access experts and general bookings
router.get('/experts', AppointmentController.listExperts);
router.post(
  '/book',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 }
  ]),
  validateBody(['date', 'timeSlot']),
  AppointmentController.bookAppointment
);
router.get('/list', AppointmentController.listAppointments);
router.put('/status/:id', validateBody(['status']), AppointmentController.updateStatus);

export default router;
