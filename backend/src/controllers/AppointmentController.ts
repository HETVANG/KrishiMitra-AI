import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';

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
      const { expertId, date, timeSlot, notes } = req.body;

      // Live Mode
      const expert = await User.findOne({ _id: expertId, role: 'expert' });
      if (!expert) {
        return res.status(404).json({ success: false, message: 'Agriculture Expert not found' });
      }

      const conflict = await Appointment.findOne({ expert: expertId, date, timeSlot, status: 'approved' });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'This timeslot has already been booked.' });
      }

      const appointment = await Appointment.create({
        farmer: req.user._id,
        expert: expertId,
        date,
        timeSlot,
        notes,
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

      // Live Mode
      let appointments;
      if (req.user.role === 'expert') {
        appointments = await Appointment.find({ expert: req.user._id })
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

      if (!['approved', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status update request' });
      }

      // Live Mode
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const isExpert = appointment.expert.toString() === req.user._id.toString();
      const isFarmer = appointment.farmer.toString() === req.user._id.toString();

      if (!isExpert && !isFarmer) {
        return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
      }

      appointment.status = status;
      if (status === 'approved') {
        const randRoom = Math.random().toString(36).substring(7);
        appointment.meetLink = `https://meet.jit.si/KrishiMitraConsultation_${randRoom}`;
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
