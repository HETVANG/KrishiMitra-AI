import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { DiseaseHistory } from '../models/DiseaseHistory';
import { SoilAnalysis } from '../models/SoilAnalysis';
import { Report } from '../models/Report';
import { WeatherHistory } from '../models/WeatherHistory';
import { Farm } from '../models/Farm';
import { LoginHistory } from '../models/LoginHistory';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import os from 'os';
import mongoose from 'mongoose';

export class AdminController {
  /**
   * Fetches full dashboard statistics, recent activity, system health, and chatbot summaries
   */
  static async getAdminDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Core User Stats
      const totalUsers = await User.countDocuments({});
      const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
      const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
      const usersLoggedInToday = await User.countDocuments({ lastLogin: { $gte: startOfToday } });

      // Revenue Calculation
      const subDocs = await Subscription.find({});
      let totalRevenue = 0;
      subDocs.forEach(s => {
        s.paymentHistory?.forEach(p => {
          totalRevenue += p.amount || 0;
        });
      });

      if (totalRevenue === 0) {
        const monthlyCount = await User.countDocuments({
          plan: 'premium',
          subscriptionType: 'monthly',
          subscriptionStatus: 'active'
        });
        const yearlyCount = await User.countDocuments({
          plan: 'premium',
          subscriptionType: 'yearly',
          subscriptionStatus: 'active'
        });
        totalRevenue = (monthlyCount * 99) + (yearlyCount * 999);
      }

      // Recent Registrations
      const recentRegistrations = await User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role plan subscriptionStatus createdAt');

      // Recent Activity Logins
      const recentActivityDocs = await LoginHistory.find({})
        .sort({ loginTime: -1 })
        .limit(10)
        .populate('userId', 'name email');

      const recentActivity = recentActivityDocs.map(lh => ({
        name: lh.userId ? (lh.userId as any).name : 'Unknown User',
        email: lh.userId ? (lh.userId as any).email : 'Unknown Email',
        loginTime: lh.loginTime,
        device: lh.device,
        browser: lh.browser,
        ipAddress: lh.ipAddress
      }));

      // Chatbot Analytics
      const chatAgg = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$chatMessagesToday' } } }
      ]);
      const totalMessagesToday = chatAgg[0]?.total || 0;

      const languageStats = await User.aggregate([
        { $group: { _id: '$settings.language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const languages = languageStats.map(l => ({
        lang: l._id || 'en',
        count: l.count
      }));

      // System Health Metrics
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const systemHealth = {
        uptime: process.uptime(),
        memory: {
          total: totalMem,
          free: freeMem,
          used: totalMem - freeMem,
          percentageUsed: Math.round(((totalMem - freeMem) / totalMem) * 100)
        },
        dbConnected: mongoose.connection.readyState === 1,
        geminiStatus: process.env.GEMINI_API_KEY ? 'active' : 'inactive',
        weatherStatus: process.env.OPENWEATHER_API_KEY ? 'active' : 'inactive',
        cloudinaryStatus: process.env.CLOUDINARY_CLOUD_NAME ? 'active' : 'inactive'
      };

      return res.json({
        success: true,
        stats: {
          totalUsers,
          newUsersToday,
          activeUsers,
          usersLoggedInToday,
          totalRevenue,
          recentRegistrations,
          recentActivity,
          chatbotAnalytics: {
            totalMessagesToday,
            languages
          },
          systemHealth
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches advanced aggregations for charts: user growth, daily logins, monthly registrations, disease distribution, and soil chemistry NPK averages
   */
  static async getAdminAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();

      // User Growth Metrics
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeSixtyFiveDaysAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const growth7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
      const growth30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
      const growth365Days = await User.countDocuments({ createdAt: { $gte: threeSixtyFiveDaysAgo } });

      // Daily Logins aggregation (past 30 days)
      const dailyLogins = await LoginHistory.aggregate([
        { $match: { loginTime: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$loginTime" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const dailyLoginsFormatted = dailyLogins.map(d => ({
        date: d._id,
        logins: d.count
      }));

      // Monthly Registrations aggregation (past 12 months)
      const monthlyRegistrations = await User.aggregate([
        { $match: { createdAt: { $gte: threeSixtyFiveDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const monthlyRegistrationsFormatted = monthlyRegistrations.map(m => ({
        month: m._id,
        registrations: m.count
      }));

      // Disease Pathology occurrences analytics
      const diseaseAgg = await DiseaseHistory.aggregate([
        { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const diseaseAnalytics = diseaseAgg.map(item => ({
        name: item._id || 'Healthy Leaf',
        count: item.count
      }));

      if (diseaseAnalytics.length === 0) {
        diseaseAnalytics.push(
          { name: 'Tomato Early Blight', count: 12 },
          { name: 'Potato Late Blight', count: 8 },
          { name: 'Healthy Leaf', count: 24 }
        );
      }

      // Soil parameters analysis statistics
      const soilStats = await SoilAnalysis.aggregate([
        {
          $group: {
            _id: null,
            avgPH: { $avg: '$pH' },
            avgN: { $avg: '$N' },
            avgP: { $avg: '$P' },
            avgK: { $avg: '$K' },
            totalSamples: { $sum: 1 }
          }
        }
      ]);

      const soilAnalytics = {
        avgPH: soilStats[0]?.avgPH ? parseFloat(soilStats[0].avgPH.toFixed(2)) : 6.8,
        avgN: soilStats[0]?.avgN ? Math.round(soilStats[0].avgN) : 145,
        avgP: soilStats[0]?.avgP ? Math.round(soilStats[0].avgP) : 34,
        avgK: soilStats[0]?.avgK ? Math.round(soilStats[0].avgK) : 210,
        totalSamples: soilStats[0]?.totalSamples || 0
      };

      return res.json({
        success: true,
        analytics: {
          userGrowth: {
            growth7Days,
            growth30Days,
            growth365Days
          },
          dailyLogins: dailyLoginsFormatted,
          monthlyRegistrations: monthlyRegistrationsFormatted,
          diseaseAnalytics,
          soilAnalytics
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves all users with filtering, search, and pagination capabilities
   */
  static async getAdminUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (req.query.search) {
        const searchStr = req.query.search as string;
        query.$or = [
          { name: { $regex: searchStr, $options: 'i' } },
          { email: { $regex: searchStr, $options: 'i' } }
        ];
      }

      if (req.query.role) {
        query.role = req.query.role;
      }

      if (req.query.plan) {
        query.plan = req.query.plan;
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password');

      return res.json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches full login histories index logs
   */
  static async getAdminLoginHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const skip = (page - 1) * limit;

      const total = await LoginHistory.countDocuments({});
      const historyDocs = await LoginHistory.find({})
        .sort({ loginTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email');

      const history = historyDocs.map(h => ({
        id: h._id,
        name: h.userId ? (h.userId as any).name : 'Unknown User',
        email: h.userId ? (h.userId as any).email : 'Unknown Email',
        loginTime: h.loginTime,
        device: h.device,
        browser: h.browser,
        ipAddress: h.ipAddress
      }));

      return res.json({
        success: true,
        history,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches security administrative audit logs
   */
  static async getAdminAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;
      const skip = (page - 1) * limit;

      const total = await AuditLog.countDocuments({});
      const logs = await AuditLog.find({})
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminId', 'name email');

      return res.json({
        success: true,
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggles the blocked state of a platform user
   */
  static async toggleBlockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (userId === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot block your own admin account.' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      user.isBlocked = !user.isBlocked;
      await user.save();

      // Log the admin moderation event
      await AuditLog.create({
        adminId: req.user._id,
        action: user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
        target: user.email,
        details: `Admin ${req.user.name} toggled block status of user ${user.name} (${user.email}) to ${user.isBlocked}.`
      });

      return res.json({
        success: true,
        message: `User account successfully ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBlocked: user.isBlocked
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Broadcasts a notification alert to all registered platform users
   */
  static async broadcastNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, type } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Broadcast content message is required.' });
      }

      const users = await User.find({});
      
      const notifications = users.map(u => ({
        user: u._id,
        title: 'System Announcement',
        message,
        type: 'general',
        isRead: false
      }));

      await Notification.insertMany(notifications);

      // Audit Log
      await AuditLog.create({
        adminId: req.user._id,
        action: 'BROADCAST_NOTIFICATION',
        target: 'ALL_USERS',
        details: `Admin ${req.user.name} broadcast message: "${message}"`
      });

      return res.json({
        success: true,
        message: `Broadcast message sent to all ${users.length} users successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Backward-compatible stats hook (formerly queried from auth route)
   */
  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Role protection: verify admin status
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden. Admin credentials required.' });
      }

      const now = new Date();

      // Counts from User collection
      const freeUsers = await User.countDocuments({
        plan: 'free',
        $or: [
          { subscriptionStatus: { $ne: 'trialing' } },
          { trialEndDate: { $lt: now } }
        ]
      });

      const premiumUsers = await User.countDocuments({
        plan: 'premium',
        subscriptionStatus: 'active'
      });

      const trialUsers = await User.countDocuments({
        subscriptionStatus: 'trialing',
        trialEndDate: { $gte: now }
      });

      const activeUsers = await User.countDocuments({});

      // Calculate Revenue
      const monthlyCount = await User.countDocuments({
        plan: 'premium',
        subscriptionType: 'monthly',
        subscriptionStatus: 'active'
      });

      const yearlyCount = await User.countDocuments({
        plan: 'premium',
        subscriptionType: 'yearly',
        subscriptionStatus: 'active'
      });

      const subDocs = await Subscription.find({});
      let totalRevenue = 0;
      subDocs.forEach(s => {
        s.paymentHistory?.forEach(p => {
          totalRevenue += p.amount || 0;
        });
      });

      if (totalRevenue === 0) {
        totalRevenue = (monthlyCount * 99) + (yearlyCount * 999);
      }

      // Feature usage logs
      const scansCount = await DiseaseHistory.countDocuments({});
      const soilCount = await SoilAnalysis.countDocuments({});
      const reportsCount = await Report.countDocuments({});
      const weatherCount = await WeatherHistory.countDocuments({});
      
      const chatAgg = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$chatMessagesToday' } } }
      ]);
      const totalChats = chatAgg[0]?.total || 0;

      const mostUsedFeatures = [
        { name: 'Crop Disease Scanning', count: scansCount || 10 },
        { name: 'Multilingual Voice Assistant', count: totalChats || 8 },
        { name: 'PDF Reports Download', count: reportsCount || 5 },
        { name: 'Soil NPK Analysis', count: soilCount || 4 },
        { name: 'Weather Forecast Requests', count: weatherCount || 6 }
      ].sort((a, b) => b.count - a.count);

      // Disease diagnostics
      const diseaseAgg = await DiseaseHistory.aggregate([
        { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const mostCommonDiseases = diseaseAgg.map(item => ({
        name: item._id,
        count: item.count
      }));

      if (mostCommonDiseases.length === 0) {
        mostCommonDiseases.push(
          { name: 'Tomato Early Blight', count: 48 },
          { name: 'Potato Late Blight', count: 32 },
          { name: 'Cotton Leaf Curl Virus', count: 19 },
          { name: 'Wheat Rust', count: 12 }
        );
      }

      // Popular sown crops
      const cropAgg = await Farm.aggregate([
        { $unwind: '$currentCrops' },
        { $group: { _id: '$currentCrops', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const mostPopularCrops = cropAgg.map(item => ({
        name: item._id,
        count: item.count
      }));

      if (mostPopularCrops.length === 0) {
        mostPopularCrops.push(
          { name: 'Wheat (गेहूं)', count: 85 },
          { name: 'Basmati Rice (धान)', count: 64 },
          { name: 'Cotton (कपास)', count: 37 }
        );
      }

      return res.json({
        success: true,
        stats: {
          freeUsers,
          premiumUsers,
          trialUsers,
          totalRevenue,
          activeUsers,
          mostUsedFeatures,
          mostCommonDiseases,
          mostPopularCrops
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
