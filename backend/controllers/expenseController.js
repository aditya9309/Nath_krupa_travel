import Expense from '../models/Expense.js';

// Get all expenses
export const getAllExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = { createdBy: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// Create expense
export const createExpense = async (req, res, next) => {
  try {
    const { category, amount, date, notes } = req.body;

    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Category and amount are required'
      });
    }

    const expense = await Expense.create({
      category,
      amount,
      date: date || new Date(),
      notes,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// Update expense
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { category, amount, date, notes } = req.body;
    if (category) expense.category = category;
    if (amount !== undefined) expense.amount = amount;
    if (date) expense.date = date;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// Delete expense
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get expense report
export const getExpenseReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { createdBy: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    // Group by category
    const categoryWise = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {});

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({
      success: true,
      total,
      categoryWise,
      expenses,
      count: expenses.length
    });
  } catch (error) {
    next(error);
  }
};
