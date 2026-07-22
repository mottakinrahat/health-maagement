import { Request, Response } from "express";
import { catchAsync } from "../../../helpers/trycatch";
import { sendResponse } from "../../../helpers/sendResponse";
import { DashboardService } from "./dashboard.service";
import status from "http-status";

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getAdminDashboard();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin dashboard data retrieved successfully",
    data: result,
  });
});

const getDoctorDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDoctorDashboard((req as any).user);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor dashboard data retrieved successfully",
    data: result,
  });
});

const getPatientDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getPatientDashboard((req as any).user);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Patient dashboard data retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
};
