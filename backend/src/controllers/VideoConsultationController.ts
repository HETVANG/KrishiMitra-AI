import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { VideoConsultation } from '../models/VideoConsultation';
import { CloudinaryService } from '../services/CloudinaryService';

const generateRequestId = (): string => {
  return `VC-${Math.floor(10000 + Math.random() * 90000)}`;
};

export class VideoConsultationController {
  static async createRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Crop problem video is required.' });
      }

      const { cropName, category, description, farmName, village, district, state, priority } = req.body;

      if (!cropName || !category || !description) {
        return res.status(400).json({ success: false, message: 'Crop Name, Category, and Description are required.' });
      }

      // Upload video buffer to Cloudinary
      const videoUrl = await CloudinaryService.uploadVideoBuffer(req.file.buffer, req.file.mimetype);

      const requestId = generateRequestId();

      const consultation = await VideoConsultation.create({
        requestId,
        farmer: req.user._id,
        videoUrl,
        cropName,
        category,
        description,
        farmDetails: {
          farmName: farmName || '',
          village: village || '',
          district: district || '',
          state: state || ''
        },
        priority: priority || 'Normal',
        status: 'Pending'
      });

      return res.status(201).json({
        success: true,
        message: 'Your consultation request has been submitted successfully.',
        consultation
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFarmerRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const requests = await VideoConsultation.find({ farmer: req.user._id })
        .populate('expert', 'name email profileImage')
        .sort({ createdAt: -1 });

      return res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  static async getExpertRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'expert') {
        return res.status(403).json({ success: false, message: 'Access denied. Expert role required.' });
      }

      // Experts see pending requests and requests assigned to themselves
      const requests = await VideoConsultation.find({
        $or: [
          { status: 'Pending' },
          { expert: req.user._id }
        ]
      })
        .populate('farmer', 'name email phone')
        .sort({ createdAt: -1 });

      return res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'expert') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const { id } = req.params;
      const request = await VideoConsultation.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Consultation request not found.' });
      }

      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'This request is already accepted/assigned.' });
      }

      request.expert = req.user._id;
      request.status = 'Assigned';
      
      // Notify Farmer
      request.notifications.push({
        message: `Expert ${req.user.name} has accepted your consultation request.`,
        type: 'accepted'
      });

      await request.save();

      return res.json({ success: true, message: 'Request accepted successfully.', request });
    } catch (error) {
      next(error);
    }
  }

  static async respondToRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== 'expert') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const { id } = req.params;
      const { text, recommendations } = req.body;

      const request = await VideoConsultation.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Consultation request not found.' });
      }

      if (request.expert?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this request.' });
      }

      let responseVideoUrl = request.response?.videoUrl || '';
      let attachmentsList = request.response?.attachments || [];

      // Handle file uploads (video response or attachment files)
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files['responseVideo'] && files['responseVideo'][0]) {
          responseVideoUrl = await CloudinaryService.uploadVideoBuffer(
            files['responseVideo'][0].buffer,
            files['responseVideo'][0].mimetype
          );
        }
        if (files['attachment'] && files['attachment'][0]) {
          const docUrl = await CloudinaryService.uploadFileBuffer(
            files['attachment'][0].buffer,
            files['attachment'][0].mimetype
          );
          attachmentsList.push(docUrl);
        }
      }

      request.response = {
        text: text || '',
        videoUrl: responseVideoUrl,
        attachments: attachmentsList,
        recommendations: recommendations || '',
        repliedAt: new Date()
      };
      
      request.status = 'Expert Replied';

      // Notify Farmer
      request.notifications.push({
        message: `Expert ${req.user.name} has replied to your request ${request.requestId}.`,
        type: 'replied'
      });

      await request.save();

      return res.json({ success: true, message: 'Response submitted successfully.', request });
    } catch (error) {
      next(error);
    }
  }

  static async completeRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await VideoConsultation.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Consultation request not found.' });
      }

      request.status = 'Completed';

      request.notifications.push({
        message: `Your consultation request ${request.requestId} has been marked completed.`,
        type: 'completed'
      });

      await request.save();

      return res.json({ success: true, message: 'Consultation marked completed successfully.', request });
    } catch (error) {
      next(error);
    }
  }
}
