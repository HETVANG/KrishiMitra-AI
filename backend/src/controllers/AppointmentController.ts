import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { CloudinaryService } from '../services/CloudinaryService';

export class AppointmentController {
  /**
   * List available agriculture experts
   */
  static async listExperts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Live Mode
      const experts = await User.find({ role: 'expert', 'expertProfile.isAvailable': true })
        .select('name email phone expertProfile');

      return res.json({
        success: true,
        experts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request / book an appointment slot
   */
  static async bookAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { 
        expertId, 
        date, 
        timeSlot, 
        notes,
        cropName,
        category,
        description,
        preferredLanguage,
        consultationType
      } = req.body;

      if (!date || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Preferred Date and Time Slot are required.' });
      }

      // Check conflict if expert is specified
      if (expertId) {
        const expert = await User.findOne({ _id: expertId, role: 'expert' });
        if (!expert) {
          return res.status(404).json({ success: false, message: 'Agriculture Expert not found' });
        }

        const conflict = await Appointment.findOne({ expert: expertId, date, timeSlot, status: { $in: ['accepted', 'scheduled'] } });
        if (conflict) {
          return res.status(400).json({ success: false, message: 'This timeslot has already been booked with this expert.' });
        }
      }

      // Handle file uploads (crop photos and videos)
      const images: string[] = [];
      const videos: string[] = [];

      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files['images']) {
          for (const file of files['images']) {
            try {
              const url = await CloudinaryService.uploadImageBuffer(file.buffer, file.mimetype);
              images.push(url);
            } catch (err) {
              console.error('[Book Appointment] Image upload failed:', err);
            }
          }
        }
        if (files['videos']) {
          for (const file of files['videos']) {
            try {
              const url = await CloudinaryService.uploadVideoBuffer(file.buffer, file.mimetype);
              videos.push(url);
            } catch (err) {
              console.error('[Book Appointment] Video upload failed:', err);
            }
          }
        }
      }

      const appointment = await Appointment.create({
        farmer: req.user._id,
        expert: expertId || undefined,
        date,
        timeSlot,
        notes: notes || description || '',
        cropName: cropName || '',
        category: category || 'Other',
        description: description || notes || '',
        preferredLanguage: preferredLanguage || 'English',
        consultationType: consultationType || 'Video',
        images,
        videos,
        status: 'pending'
      });

      return res.status(201).json({
        success: true,
        appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List appointments
   */
  static async listAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      let appointments;
      if (req.user.role === 'expert') {
        // Experts see their bookings and general pending bookings
        appointments = await Appointment.find({
          $or: [
            { expert: req.user._id },
            { expert: { $exists: false }, status: 'pending' },
            { expert: null, status: 'pending' }
          ]
        })
          .populate('farmer', 'name email phone')
          .sort({ date: 1, timeSlot: 1 });
      } else {
        appointments = await Appointment.find({ farmer: req.user._id })
          .populate('expert', 'name email phone expertProfile')
          .sort({ date: 1, timeSlot: 1 });
      }

      return res.json({
        success: true,
        appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update appointment status
   */
  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status update request' });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const isExpert = req.user.role === 'expert';
      const isFarmer = appointment.farmer.toString() === req.user._id.toString();

      if (!isExpert && !isFarmer) {
        return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
      }

      appointment.status = status;
      
      // If expert accepts/schedules a pending request
      if (['accepted', 'scheduled'].includes(status) && isExpert) {
        if (!appointment.expert) {
          appointment.expert = req.user._id; // Assign themselves to general booking request
        }
        if (!appointment.meetLink) {
          const randRoom = Math.random().toString(36).substring(7);
          appointment.meetLink = `https://meet.jit.si/KrishiMitraConsultation_${randRoom}`;
        }
      }

      await appointment.save();

      return res.json({
        success: true,
        appointment,
      });
    } catch (error) {
      next(error);
    }
  }
}
