import { catchAsync } from "../../../helpers/trycatch";
import { Request, Response } from "express";
import { sendResponse } from "../../../helpers/sendResponse";
import status from "http-status";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
 

  const result = await paymentService.initPayment();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Patient retrieval successfully'
  });
});
export const paymentController={
    getAllFromDB
}
