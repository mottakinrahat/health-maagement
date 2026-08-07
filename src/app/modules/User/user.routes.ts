import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../prisma/generated/prisma";
import { fileUploader } from "../../../helpers/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMyProfile,
);

router.post(
  "/create-admin",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body?.data) {
        return res.status(400).json({
          success: false,
          message: "Request body 'data' field is required as stringified JSON in form-data",
        });
      }
      req.body = UserValidation.createAdminValidation.parse(
        JSON.parse(req.body.data)
      );
      return UserController.createAdminUser(req, res, next);
    } catch (err: any) {
      next(err);
    }
  }
);

router.post(
  "/create-doctor",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body?.data) {
        return res.status(400).json({
          success: false,
          message: "Request body 'data' field is required as stringified JSON in form-data",
        });
      }
      req.body = UserValidation.createDoctorValidationSchema.parse(
        JSON.parse(req.body.data)
      );
      return UserController.createDoctor(req, res, next);
    } catch (err: any) {
      next(err);
    }
  }
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body?.data) {
        return res.status(400).json({
          success: false,
          message: "Request body 'data' field is required as stringified JSON in form-data",
        });
      }
      req.body = UserValidation.createPatientValidationSchema.parse(
        JSON.parse(req.body.data)
      );
      return UserController.createPatient(req, res, next);
    } catch (err: any) {
      next(err);
    }
  }
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUser
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.changeProfileStatus
);

router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }
      return UserController.updateMyProfile(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

export const userRoutes = router;
