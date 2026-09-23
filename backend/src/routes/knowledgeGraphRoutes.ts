import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { KnowledgeGraphController } from '../controllers/KnowledgeGraphController';

const router = Router();

// Protected Knowledge Graph Endpoints
router.get('/farms/:farmId', authenticate, KnowledgeGraphController.getFarmGraph);
router.get('/crop-context/:cropCycleId', authenticate, KnowledgeGraphController.getCropContext);
router.get('/risks', authenticate, KnowledgeGraphController.getFarmRisks);

export default router;
