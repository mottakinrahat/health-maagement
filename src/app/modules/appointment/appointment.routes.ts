import express from "express";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../prisma/generated/prisma";
import validateRequest from "../../middleWares/validateRequest";
import { AppointmentValidation } from "./appointment.validation";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(AppointmentValidation.create),
  AppointmentController.createAppointment
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AppointmentController.getAllFromDB
);

router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointments
);

router.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  validateRequest(AppointmentValidation.updateStatus),
  AppointmentController.updateStatus
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AppointmentController.cancelAppointment
);

export const AppointmentRoutes = router;
