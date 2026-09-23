import { Request, Response } from 'express';
import { FarmKnowledgeGraphService } from '../services/knowledgeGraph/farmKnowledgeGraphService';

export class KnowledgeGraphController {
  /**
   * GET /api/knowledge-graph/farms/:farmId
   */
  static async getFarmGraph(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.params.farmId;
      const graph = await FarmKnowledgeGraphService.getFarmGraph(userId, farmId);
      res.json({
        success: true,
        data: graph
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge-graph/crop-context/:cropCycleId
   */
  static async getCropContext(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const cropCycleId = req.params.cropCycleId;
      const context = await FarmKnowledgeGraphService.getCropContext(userId, cropCycleId);
      res.json({
        success: true,
        data: context
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/knowledge-graph/risks
   */
  static async getFarmRisks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const farmId = req.query.farmId as string;
      const result = await FarmKnowledgeGraphService.getFarmRisks(userId, farmId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
