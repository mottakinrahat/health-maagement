import { Request, Response } from "express";
import { catchAsync } from "../../../helpers/trycatch";
import { sendResponse } from "../../../helpers/sendResponse";
import { pick } from "../../../shared/pick";
import { PrescriptionService } from "./prescription.service";
import status from "http-status";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.createPrescription(
    (req as any).user,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const getMyPrescriptions = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.getMyPrescriptions(
    (req as any).user,
    options
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.getById(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Prescription retrieved successfully",
    data: result,
  });
});

export const PrescriptionController = {
  createPrescription,
  getMyPrescriptions,
  getById,
};
