import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { Forum } from '../models/Forum';

const router = Router();

// 1. GET /api/community/posts/:id/comments
router.get('/posts/:id/comments', async (req: AuthRequest, res: Response, next) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.json({ success: true, comments: post.comments || [] });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 500 characters' });
    }

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const newComment = {
      userId: user._id,
      username: user.name,
      profileImage: user.profileImage || '',
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Backward compatibility fields
      author: user._id,
      name: user.name,
      content: text.trim()
    };

    post.comments.push(newComment as any);
    await post.save();

    return res.status(201).json({ success: true, comments: post.comments });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/community/comments/:commentId
router.put('/comments/:commentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 500 characters' });
    }

    const post = await Forum.findOne({ 'comments._id': req.params.commentId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized action' });
    }

    comment.text = text.trim();
    comment.content = text.trim(); // compatibility
    comment.updatedAt = new Date();

    await post.save();
    return res.json({ success: true, comments: post.comments });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE /api/community/comments/:commentId
router.delete('/comments/:commentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const post = await Forum.findOne({ 'comments._id': req.params.commentId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized action' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    return res.json({ success: true, comments: post.comments });
  } catch (error) {
    next(error);
  }
});

export default router;
