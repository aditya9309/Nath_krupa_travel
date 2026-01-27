import express from 'express';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseReport
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All expense routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/report', getExpenseReport);

export default router;
