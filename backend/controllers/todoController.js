import Todo from '../models/Todo.js';

// Get all todos
export const getAllTodos = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const query = { createdBy: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const todos = await Todo.find(query)
      .sort({ dueDate: 1, createdAt: -1 });

    // Get upcoming reminders
    const now = new Date();
    const upcomingReminders = todos.filter(todo => 
      todo.reminderDate && 
      todo.reminderDate > now && 
      todo.status !== 'completed'
    );

    res.status(200).json({
      success: true,
      count: todos.length,
      todos,
      upcomingReminders: upcomingReminders.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

// Create todo
export const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, reminderDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const todo = await Todo.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      reminderDate,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    next(error);
  }
};

// Update todo
export const updateTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (todo.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { title, description, priority, status, dueDate, reminderDate } = req.body;
    if (title) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority) todo.priority = priority;
    if (status) {
      todo.status = status;
      if (status === 'completed' && !todo.completedAt) {
        todo.completedAt = new Date();
      } else if (status !== 'completed') {
        todo.completedAt = undefined;
      }
    }
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (reminderDate !== undefined) todo.reminderDate = reminderDate;

    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      todo
    });
  } catch (error) {
    next(error);
  }
};

// Delete todo
export const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    if (todo.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
