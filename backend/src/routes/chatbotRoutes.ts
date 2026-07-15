import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { GeminiService } from '../services/GeminiService';
import { validateBody } from '../middleware/validator';
import { limitScansAndChats } from '../middleware/subscription';
import { User } from '../models/User';

const router = Router();

router.post(
  '/message',
  authenticate,
  limitScansAndChats,
  validateBody(['message']),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { message, history, language } = req.body;
      
      const chatObj = await GeminiService.getChatResponse(
        message,
        history || [],
        language || req.user?.settings?.language || 'en'
      );

      // Increment daily chat counter in MongoDB
      try {
        await User.findByIdAndUpdate(req.user._id, { $inc: { chatMessagesToday: 1 } });
        req.user.chatMessagesToday = (req.user.chatMessagesToday || 0) + 1;
      } catch (dbErr) {
        console.warn('[Chat Increment Warning]', dbErr);
      }

      return res.json({
        success: true,
        reply: chatObj.translated,
        originalEnglishReply: chatObj.english,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
