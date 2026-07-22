import { Request, Response } from "express";
import { catchAsync } from "../../../helpers/trycatch";
import { sendResponse } from "../../../helpers/sendResponse";
import { pick } from "../../../shared/pick";
import { AppointmentService } from "./appointment.service";
import status from "http-status";

const appointmentFilterableFields = [
  "status",
  "paymentStatus",
  "doctorId",
  "patientId",
];

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentService.createAppointment(
    (req as any).user,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AppointmentService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AppointmentService.getMyAppointments(
    (req as any).user,
    filters,
    options
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "My appointments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AppointmentService.updateStatus(
    id,
    req.body.status,
    (req as any).user
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointment status updated successfully",
    data: result,
  });
});

const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AppointmentService.cancelAppointment(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointment cancelled successfully",
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
  getAllFromDB,
  getMyAppointments,
  updateStatus,
  cancelAppointment,
};
