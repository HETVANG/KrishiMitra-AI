import { Router } from 'express';
import { ForumController } from '../controllers/ForumController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.get('/list', ForumController.listPosts);
router.get('/details/:id', ForumController.getPostDetails);

// Protected routes
router.post('/create', authenticate, validateBody(['title', 'content']), ForumController.createPost);
router.post('/like/:id', authenticate, ForumController.toggleLike);
router.post('/comment/:id', authenticate, validateBody(['content']), ForumController.addComment);
router.delete('/delete/:id', authenticate, ForumController.deletePost);

export default router;
