import { Request, Response } from "express";
import { catchAsync } from "../../../helpers/trycatch";
import { sendResponse } from "../../../helpers/sendResponse";
import { PaymentService } from "./payment.service";
import status from "http-status";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initiatePayment(
    req.params.appointmentId,
    (req as any).user
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

// SSLCommerz webhooks (POST from SSLCommerz server — no auth middleware)
const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query as { tran_id: string };
  await PaymentService.confirmPayment(tran_id);
  res.redirect(
    `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/success?tran_id=${tran_id}`
  );
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query as { tran_id: string };
  await PaymentService.failPayment(tran_id);
  res.redirect(
    `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/fail?tran_id=${tran_id}`
  );
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query as { tran_id: string };
  await PaymentService.failPayment(tran_id);
  res.redirect(
    `${process.env.CLIENT_URL || "http://localhost:3000"}/payment/cancel?tran_id=${tran_id}`
  );
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getMyPayments((req as any).user);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  getMyPayments,
};
