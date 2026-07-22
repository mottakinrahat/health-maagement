import express from "express";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../prisma/generated/prisma";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get(
  "/admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DashboardController.getAdminDashboard
);

router.get(
  "/doctor",
  auth(UserRole.DOCTOR),
  DashboardController.getDoctorDashboard
);

router.get(
  "/patient",
  auth(UserRole.PATIENT),
  DashboardController.getPatientDashboard
);

export const DashboardRoutes = router;
