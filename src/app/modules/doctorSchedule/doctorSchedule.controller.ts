import status from "http-status";
import { sendResponse } from "../../../helpers/sendResponse";
import { catchAsync } from "../../../helpers/trycatch";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { Request, Response } from "express";
import { pick } from "../../../shared/pick";

const insertIntoDB = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await DoctorScheduleService.insertIntoDB(req.user, req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor Schedule created successfully",
    data: result,
  });
});

const getMySchedules = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorScheduleService.getMySchedules(req.user, options);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My schedules retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorScheduleService.getAllFromDB(options);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All doctor schedules retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deleteFromDB = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await DoctorScheduleService.deleteFromDB(req.user, req.params.scheduleId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Doctor schedule removed successfully",
    data: result,
  });
});

export const DoctorScheduleController = {
  insertIntoDB,
  getMySchedules,
  getAllFromDB,
  deleteFromDB,
};