import express from "express";
import { UserRole } from "../../../../prisma/generated/prisma";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { auth } from "../../middleWares/auth";
import validateRequest from "../../middleWares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = express.Router();

router.get(
  "/",
  DoctorScheduleController.getAllFromDB
);

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getMySchedules
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(DoctorScheduleValidation.create),
  DoctorScheduleController.insertIntoDB
);

router.delete(
  "/:scheduleId",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteFromDB
);

export const DoctorScheduleRoutes = router;