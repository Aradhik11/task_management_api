import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskTime,
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import {
  taskValidation,
  taskUpdateValidation,
  paginationValidation,
  idValidation,
} from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

// Apply authentication to all task routes
router.use(authenticateToken);

router.post('/', taskValidation, createTask);
router.get('/', paginationValidation, getTasks);
router.get('/:id', idValidation, getTaskById);
router.put('/:id', [...idValidation, ...taskUpdateValidation], updateTask);
router.delete('/:id', idValidation, deleteTask);
router.put('/:id/time', idValidation, updateTaskTime);

export default router;