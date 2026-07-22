import express from "express";
import { auth } from "../../middleWares/auth";
import { UserRole } from "../../../../prisma/generated/prisma";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// Patient initiates payment for an appointment
router.post(
  "/init/:appointmentId",
  auth(UserRole.PATIENT),
  PaymentController.initiatePayment
);

// SSLCommerz webhooks (public — called by SSLCommerz server)
router.post("/success", PaymentController.paymentSuccess);
router.post("/fail", PaymentController.paymentFail);
router.post("/cancel", PaymentController.paymentCancel);

// Patient views own payment history
router.get("/my-payments", auth(UserRole.PATIENT), PaymentController.getMyPayments);

export const PaymentRoutes = router;
