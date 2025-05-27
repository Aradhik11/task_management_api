import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;