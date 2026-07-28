import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { videoUpload } from '../middleware/upload';
import { VideoConsultationController } from '../controllers/VideoConsultationController';

const router = Router();

// Farmer endpoints
router.post('/request', authenticate, videoUpload.single('video'), VideoConsultationController.createRequest);
router.get('/farmer-requests', authenticate, VideoConsultationController.getFarmerRequests);

// Expert endpoints
router.get('/expert-requests', authenticate, VideoConsultationController.getExpertRequests);
router.put('/accept/:id', authenticate, VideoConsultationController.acceptRequest);
router.post(
  '/respond/:id',
  authenticate,
  videoUpload.fields([
    { name: 'responseVideo', maxCount: 1 },
    { name: 'attachment', maxCount: 1 }
  ]),
  VideoConsultationController.respondToRequest
);
router.put('/complete/:id', authenticate, VideoConsultationController.completeRequest);

export default router;
