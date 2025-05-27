import { Router } from 'express';
import { getTaskReport, getTimeReport } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting endpoints
 */

// Apply authentication to all report routes
router.use(authenticateToken);

router.get('/', getTaskReport);
router.get('/report-time', getTimeReport);

export default router;