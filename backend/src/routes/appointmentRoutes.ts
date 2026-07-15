import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { requirePremium } from '../middleware/subscription';

const router = Router();

router.use(authenticate);

// Listing and booking experts are premium features
router.get('/experts', requirePremium, AppointmentController.listExperts);
router.post('/book', requirePremium, validateBody(['expertId', 'date', 'timeSlot']), AppointmentController.bookAppointment);
router.get('/list', AppointmentController.listAppointments);
router.put('/status/:id', validateBody(['status']), AppointmentController.updateStatus);

export default router;
