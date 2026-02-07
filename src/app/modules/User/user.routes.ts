import express from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../generated/prisma";
import multer from "multer";
import path from "path";
import { fileUploader } from "../../../helpers/fileUploader";


const router = express.Router();



router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  UserController.createAdminUser,
); //
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.createAdminUser,
);
export const userRoutes = router;
