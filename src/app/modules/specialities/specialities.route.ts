import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialities.controller";
import { fileUploader } from "../../../helpers/fileUploader";
const router = express.Router();

router.post(
  "/createSpecialties",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
  return specialtiesController.createSpecialties(req, res, next);
  },
);
export const specialtiesRoutes = router;
