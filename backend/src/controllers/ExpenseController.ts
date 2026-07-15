import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';

export class ExpenseController {
  /**
   * Add a new financial transaction
   */
  static async addExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { type, category, amount, date, description } = req.body;

      const expense = await Expense.create({
        user: req.user._id,
        type,
        category,
        amount: Number(amount),
        date: date || new Date(),
        description,
      });

      return res.status(201).json({
        success: true,
        expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user ledger log lists
   */
  static async listExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

      return res.json({
        success: true,
        expenses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete transaction record
   */
  static async deleteExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
      const { id } = req.params;

      const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Transaction record not found' });
      }

      return res.json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns data aggregated for Charts
   */
  static async getSummaryStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const expensesList = await Expense.find({ user: req.user._id });

      let totalIncome = 0;
      let totalExpense = 0;
      const categoryTotals: Record<string, number> = {
        seeds: 0,
        fertilizer: 0,
        labor: 0,
        fuel: 0,
        equipment: 0,
        other: 0
      };

      expensesList.forEach((item) => {
        if (item.type === 'income') {
          totalIncome += item.amount;
        } else {
          totalExpense += item.amount;
          if (categoryTotals[item.category] !== undefined) {
            categoryTotals[item.category] += item.amount;
          } else {
            categoryTotals.other += item.amount;
          }
        }
      });

      const chartData = Object.keys(categoryTotals).map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: categoryTotals[cat]
      }));

      return res.json({
        success: true,
        summary: {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          chartData
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
