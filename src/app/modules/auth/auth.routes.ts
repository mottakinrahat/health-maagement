import express from 'express';
import { authController } from './auth.controller';
import { auth } from '../../middleWares/auth';
import { UserRole } from '../../../../generated/prisma';
const router = express.Router();

router.post('/login',auth(UserRole.SUPER_ADMIN,UserRole.ADMIN), authController.loginUser);
router.post('/refreshToken',auth(UserRole.SUPER_ADMIN,UserRole.ADMIN), authController.refreshToken);
router.post('/change-password',auth(UserRole.SUPER_ADMIN,UserRole.ADMIN,UserRole.DOCTOR,UserRole.NURSE,UserRole.PATIENT), authController.changePassword);

export const authRoutes = router;

