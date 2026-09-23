import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';

export class NotificationController {
  /**
   * GET /api/notifications
   * Fetch paginated list of user notifications
   */
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { farmId, status, priority, type, limit = 20, page = 1 } = req.query;

      const query: any = { user: userId };
      if (farmId) query.farm = farmId;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (type) query.type = type;

      const skip = (Number(page) - 1) * Number(limit);
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ user: userId, status: 'UNREAD' });

      res.json({
        success: true,
        data: notifications,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        },
        unreadCount
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/notifications/unread
   * Get fast count of unread notifications
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const count = await Notification.countDocuments({ user: userId, status: 'UNREAD' });

      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/notifications/:id/read
   * Mark notification as READ
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const notifId = req.params.id;

      const notif = await Notification.findOneAndUpdate(
        { _id: notifId, user: userId },
        { status: 'READ', isRead: true },
        { new: true }
      );

      if (!notif) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.json({ success: true, data: notif });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/notifications/:id/acknowledge
   * Acknowledge notification
   */
  static async acknowledgeNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const notifId = req.params.id;

      const notif = await Notification.findOneAndUpdate(
        { _id: notifId, user: userId },
        {
          status: 'ACKNOWLEDGED',
          isRead: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: userId
        },
        { new: true }
      );

      if (!notif) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.json({ success: true, data: notif });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/notifications/:id/dismiss
   * Dismiss notification
   */
  static async dismissNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const notifId = req.params.id;

      const notif = await Notification.findOneAndUpdate(
        { _id: notifId, user: userId },
        {
          status: 'DISMISSED',
          isRead: true,
          dismissedAt: new Date(),
          dismissedBy: userId
        },
        { new: true }
      );

      if (!notif) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.json({ success: true, data: notif });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/notifications/preferences
   * Retrieve notification preferences and quiet hours
   */
  static async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      let pref = await NotificationPreference.findOne({ user: userId }).lean();

      if (!pref) {
        pref = await NotificationPreference.create({ user: userId });
      }

      res.json({ success: true, data: pref });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/notifications/preferences
   * Update notification preferences & quiet hours
   */
  static async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const updates = req.body;

      const pref = await NotificationPreference.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true }
      );

      res.json({ success: true, data: pref });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
