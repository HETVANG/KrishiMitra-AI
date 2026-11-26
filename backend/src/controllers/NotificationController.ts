import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';
import { DeviceToken } from '../models/DeviceToken';
import { FCMService } from '../services/fcmService';

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

  /**
   * POST /api/notifications/devices/register
   * Securely register or refresh an FCM device token for the authenticated user.
   * Prevents duplicates and associates token with current user.
   */
  static async registerDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { token, platform = 'android', deviceModel, appVersion } = req.body;

      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Valid FCM registration token is required' });
        return;
      }

      const cleanToken = token.trim();
      const validPlatform = platform === 'ios' ? 'ios' : platform === 'web' ? 'web' : 'android';

      // Upsert: associates token uniquely with this user, reactivates it if previously inactive
      const device = await DeviceToken.findOneAndUpdate(
        { token: cleanToken },
        {
          $set: {
            user: userId,
            token: cleanToken,
            platform: validPlatform,
            deviceModel: deviceModel ? String(deviceModel).trim() : undefined,
            appVersion: appVersion ? String(appVersion).trim() : undefined,
            isActive: true,
            lastUsedAt: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({
        success: true,
        message: 'Device token registered successfully',
        data: {
          id: device._id,
          platform: device.platform,
          lastUsedAt: device.lastUsedAt
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/notifications/devices/unregister
   * Remove or deactivate an FCM device token upon logout or permission revoke.
   */
  static async unregisterDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        res.status(400).json({ success: false, error: 'FCM token is required' });
        return;
      }

      const cleanToken = token.trim();

      // Only remove if it belongs to the authenticated user
      await DeviceToken.findOneAndDelete({ token: cleanToken, user: userId });

      res.status(200).json({
        success: true,
        message: 'Device token unregistered successfully'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/notifications/test-fcm
   * Authenticated test-only endpoint to send a single push notification to the requesting user's registered device.
   * Strictly gated: only targets req.user.id, never sends to other users, requires authentication.
   */
  static async sendTestPush(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      if (!FCMService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: 'Firebase Admin credentials not configured on backend',
          code: 'FCM_UNCONFIGURED'
        });
        return;
      }

      const result = await FCMService.sendToUser(userId, {
        title: '🌾 The Khedut: Test Push Notification',
        body: 'Your Firebase Cloud Messaging push notification integration is verified and working!',
        data: {
          type: 'weather',
          actionUrl: '/dashboard'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Test notification dispatched',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
