import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Forum } from '../models/Forum';

export class ForumController {
  /**
   * Create a community thread
   */
  static async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { title, content, mediaUrl, tags } = req.body;

      const post = await Forum.create({
        title,
        content,
        mediaUrl,
        tags: tags || [],
        author: req.user._id,
      });

      return res.status(201).json({
        success: true,
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all posts
   */
  static async listPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const posts = await Forum.find()
        .populate('author', 'name role')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        posts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch specific thread details
   */
  static async getPostDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const post = await Forum.findById(id)
        .populate('author', 'name role')
        .populate('comments.author', 'name role');

      if (!post) {
        return res.status(404).json({ success: false, message: 'Forum post not found' });
      }

      return res.json({
        success: true,
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Like / Unlike toggle
   */
  static async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { id } = req.params;

      const post = await Forum.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const isLiked = post.likes.includes(req.user._id);

      if (isLiked) {
        post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();

      return res.json({
        success: true,
        likesCount: post.likes.length,
        isLiked: !isLiked,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit comment
   */
  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
      }

      const post = await Forum.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const newComment = {
        author: req.user._id,
        name: req.user.name,
        content: content.trim(),
        createdAt: new Date(),
      };

      post.comments.push(newComment);
      await post.save();

      const updatedPost = await Forum.findById(id)
        .populate('author', 'name role')
        .populate('comments.author', 'name role');

      return res.status(201).json({
        success: true,
        comments: updatedPost?.comments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete post
   */
  static async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { id } = req.params;

      const post = await Forum.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized action' });
      }

      await Forum.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
