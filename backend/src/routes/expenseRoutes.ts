import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';

const router = Router();

router.use(authenticate);

router.post('/add', validateBody(['type', 'category', 'amount']), ExpenseController.addExpense);
router.get('/list', ExpenseController.listExpenses);
router.delete('/delete/:id', ExpenseController.deleteExpense);
router.get('/summary', ExpenseController.getSummaryStats);

export default router;
