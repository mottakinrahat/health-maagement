import express from "express";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../prisma/generated/prisma";
import validateRequest from "../../middleWares/validateRequest";
import { PrescriptionValidation } from "./prescription.validation";
import { PrescriptionController } from "./prescription.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(PrescriptionValidation.create),
  PrescriptionController.createPrescription
);

router.get(
  "/my-prescriptions",
  auth(UserRole.PATIENT),
  PrescriptionController.getMyPrescriptions
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  PrescriptionController.getById
);

export const PrescriptionRoutes = router;
