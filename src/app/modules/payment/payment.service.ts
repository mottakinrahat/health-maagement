import axios from "axios";
import prisma from "../../../shared/prisma";
import { PaymentStatus } from "../../../../prisma/generated/prisma";
import { randomUUID } from "crypto";

const SSL_STORE_ID = process.env.SSL_STORE_ID || "progr69b6aa9d0f43f";
const SSL_STORE_PASS = process.env.SSL_STORE_PASS || "progr69b6aa9d0f43f@ssl";
const SSL_API_URL =
  process.env.SSL_API_URL ||
  "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const initiatePayment = async (appointmentId: string, user: any) => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true, patient: true },
  });

  if (appointment.paymentStatus === PaymentStatus.PAID) {
    throw new Error("This appointment is already paid");
  }

  const transactionId = `TXN-${randomUUID()}`;

  const paymentData = {
    store_id: SSL_STORE_ID,
    store_passwd: SSL_STORE_PASS,
    total_amount: appointment.doctor.appointmentFee,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${BACKEND_URL}/api/v1/payment/success?tran_id=${transactionId}`,
    fail_url: `${BACKEND_URL}/api/v1/payment/fail?tran_id=${transactionId}`,
    cancel_url: `${BACKEND_URL}/api/v1/payment/cancel?tran_id=${transactionId}`,
    ipn_url: `${BACKEND_URL}/api/v1/payment/ipn`,
    shipping_method: "N/A",
    product_name: "Doctor Consultation",
    product_category: "Healthcare",
    product_profile: "general",
    cus_name: appointment.patient.name,
    cus_email: appointment.patient.email,
    cus_add1: appointment.patient.address || "N/A",
    cus_city: "N/A",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: appointment.patient.contactNumber || "N/A",
    ship_name: appointment.patient.name,
    ship_add1: "N/A",
    ship_city: "N/A",
    ship_postcode: "1000",
    ship_country: "Bangladesh",
  };

  const response = await axios.post(SSL_API_URL, paymentData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!response.data?.GatewayPageURL) {
    throw new Error("Failed to initiate payment gateway");
  }

  // Save initial payment record
  await prisma.payment.create({
    data: {
      appointmentId,
      amount: appointment.doctor.appointmentFee,
      transactionId,
      status: PaymentStatus.UNPAID,
    },
  });

  return { paymentUrl: response.data.GatewayPageURL, transactionId };
};

const confirmPayment = async (transactionId: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { transactionId },
  });

  return await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.PAID },
    });

    await tx.appointment.update({
      where: { id: payment.appointmentId },
      data: { paymentStatus: PaymentStatus.PAID },
    });

    return updatedPayment;
  });
};

const failPayment = async (transactionId: string) => {
  return await prisma.payment.update({
    where: { transactionId },
    data: { status: PaymentStatus.UNPAID },
  });
};

const getMyPayments = async (user: any) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  return await prisma.payment.findMany({
    where: { appointment: { patientId: patient.id } },
    include: {
      appointment: {
        include: { doctor: true, schedule: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentService = {
  initiatePayment,
  confirmPayment,
  failPayment,
  getMyPayments,
};