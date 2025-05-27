import { Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { AuthRequest } from '../types';

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Generate task completion report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completionStats:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     inProgressTasks:
 *                       type: integer
 *                     pendingTasks:
 *                       type: integer
 *                     completionRate:
 *                       type: number
 */
export const getTaskReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Admin can see all tasks report, regular users see only their own
    const completionStats = await TaskService.getTaskCompletionStats(
      userRole === 'admin' ? undefined : userId
    );

    res.json({
      completionStats,
      generatedAt: new Date(),
      userRole,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /report-time:
 *   get:
 *     summary: Get time tracking report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Time report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeStats:
 *                   type: object
 *                   properties:
 *                     totalTimeSpent:
 *                       type: integer
 *                       description: Total time spent in minutes
 *                     averageTimePerTask:
 *                       type: number
 *                       description: Average time per task in minutes
 *                     timeByStatus:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         in-progress:
 *                           type: integer
 *                         completed:
 *                           type: integer
 */
export const getTimeReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Admin can see all tasks time report, regular users see only their own
    const timeStats = await TaskService.getTimeSpentStats(
      userRole === 'admin' ? undefined : userId
    );

    res.json({
      timeStats,
      generatedAt: new Date(),
      userRole,
    });
  } catch (error) {
    next(error);
  }
};