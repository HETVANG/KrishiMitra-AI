import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { GeminiService } from '../services/GeminiService';
import { validateBody } from '../middleware/validator';
import { limitScansAndChats } from '../middleware/subscription';
import { User } from '../models/User';
import { audioUpload } from '../middleware/upload';

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

router.post(
  '/audio',
  authenticate,
  limitScansAndChats,
  audioUpload.single('audio'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please record and upload an audio file.' });
      }

      console.info(`[Voice Upload API] Ingesting audio file of type: ${req.file.mimetype}, size: ${req.file.size} bytes`);
      const language = (req.query.language as string) || req.user?.settings?.language || 'en';
      const result = await GeminiService.transcribeAndReplyAudio(
        req.file.buffer,
        req.file.mimetype,
        language
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
        transcript: result.transcript,
        reply: result.reply,
        originalEnglishReply: result.originalEnglishReply
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
