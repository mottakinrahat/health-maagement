import { AppointmentStatus, PaymentStatus } from "../../../../prisma/generated/prisma";

export type IAppointmentFilterRequest = {
  searchTerm?: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  patientId?: string;
  doctorId?: string;
};

export type IAppointmentCreate = {
  doctorId: string;
  scheduleId: string;
};
