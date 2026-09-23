import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { KnowledgeController } from '../controllers/KnowledgeController';

const router = Router();

// Public / Protected Agriculture Knowledge routes
router.get('/crops/:crop', KnowledgeController.getCropKnowledge);
router.get('/diseases/:disease', KnowledgeController.getDiseaseKnowledge);
router.get('/soil/:type', KnowledgeController.getSoilKnowledge);
router.get('/pests/:pest', KnowledgeController.getPestKnowledge);
router.get('/nutrients/:nutrient', KnowledgeController.getNutrientKnowledge);
router.get('/practices', KnowledgeController.getPractices);
router.get('/search', KnowledgeController.searchKnowledge);

export default router;
