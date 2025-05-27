import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TaskService } from '../services/taskService';
import { AuthRequest } from '../types';

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all tasks for authenticated user
 *     tags: [Tasks]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg),
      });
      return;
    }

    const { title, description, status = 'pending', timeSpent = 0 } = req.body;
    const userId = req.user!.id;

    const task = await TaskService.createTask({
      title,
      description,
      status,
      timeSpent,
      userId,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg),
      });
      return;
    }

    const userId = req.user!.id;
    const { page, limit, status, search } = req.query;

    const result = await TaskService.getTasksByUser(userId, {
      page: page as string,
      limit: limit as string,
      status: status as string,
      search: search as string,
    });

    const totalPages = Math.ceil(result.total / result.limit);

    res.json({
      tasks: result.tasks,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg),
      });
      return;
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Admin can view any task, regular users can only view their own
    const task = await TaskService.getTaskById(taskId, userRole === 'admin' ? undefined : userId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg),
      });
      return;
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;
    const updates = req.body;

    const task = await TaskService.updateTask(taskId, userId, updates);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg),
      });
      return;
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;

    const deleted = await TaskService.deleteTask(taskId, userId);

    if (!deleted) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /tasks/{id}/time:
 *   put:
 *     summary: Update time spent on a task
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timeSpent
 *             properties:
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 description: Additional time spent in minutes
 *     responses:
 *       200:
 *         description: Time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
export const updateTaskTime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { timeSpent } = req.body;

    if (!timeSpent || timeSpent < 0) {
      res.status(400).json({ message: 'Time spent must be a non-negative number' });
      return;
    }

    const task = await TaskService.updateTaskTime(taskId, userId, timeSpent);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      message: 'Time updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};