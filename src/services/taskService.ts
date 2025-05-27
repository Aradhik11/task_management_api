import { Op } from 'sequelize';
import { Task, User } from '../models';
import { TaskAttributes, PaginationQuery } from '../types';

export class TaskService {
  static async createTask(taskData: Omit<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return Task.create(taskData);
  }

  static async getTasksByUser(
    userId: number,
    query: PaginationQuery = {}
  ): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const offset = (page - 1) * limit;

    const where: any = { userId };

    // Add status filter
    if (query.status) {
      where.status = query.status;
    }

    // Add search filter
    if (query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${query.search}%` } },
        { description: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      tasks: rows,
      total: count,
      page,
      limit,
    };
  }

  static async getTaskById(id: number, userId?: number): Promise<Task | null> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    return Task.findOne({
      where,
      include: [{ model: User, as: 'user', attributes: ['email'] }],
    });
  }

  static async updateTask(
    id: number,
    userId: number,
    updates: Partial<TaskAttributes>
  ): Promise<Task | null> {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) return null;

    await task.update(updates);
    return task;
  }

  static async deleteTask(id: number, userId: number): Promise<boolean> {
    const result = await Task.destroy({ where: { id, userId } });
    return result > 0;
  }

  static async updateTaskTime(id: number, userId: number, timeSpent: number): Promise<Task | null> {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) return null;

    await task.update({ timeSpent: task.timeSpent + timeSpent });
    return task;
  }

  static async getTaskCompletionStats(userId?: number): Promise<any> {
    const where = userId ? { userId } : {};

    const totalTasks = await Task.count({ where });
    const completedTasks = await Task.count({ where: { ...where, status: 'completed' } });
    const inProgressTasks = await Task.count({ where: { ...where, status: 'in-progress' } });
    const pendingTasks = await Task.count({ where: { ...where, status: 'pending' } });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: parseFloat(completionRate.toFixed(2)),
    };
  }

  static async getTimeSpentStats(userId?: number): Promise<any> {
    const where = userId ? { userId } : {};

    const tasks = await Task.findAll({
      where,
      attributes: ['status', 'timeSpent'],
    });

    const totalTimeSpent = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
    const avgTimePerTask = tasks.length > 0 ? totalTimeSpent / tasks.length : 0;

    const timeByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + task.timeSpent;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTimeSpent,
      averageTimePerTask: parseFloat(avgTimePerTask.toFixed(2)),
      timeByStatus,
    };
  }
}