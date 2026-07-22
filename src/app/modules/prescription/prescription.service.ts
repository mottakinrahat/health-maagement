import { Prescription } from "../../../../prisma/generated/prisma";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IPrescriptionCreate } from "./prescription.interface";

const createPrescription = async (
  user: any,
  payload: IPrescriptionCreate
): Promise<Prescription> => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
  });

  if (appointment.doctorId !== doctor.id) {
    throw new Error("You are not authorized to create prescription for this appointment");
  }

  const { items, appointmentId, followUpDate, instructions } = payload;

  return await prisma.prescription.create({
    data: {
      appointmentId,
      doctorId: doctor.id,
      patientId: appointment.patientId,
      instructions,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      items: { create: items },
    },
    include: { items: true, doctor: true, patient: true },
  });
};

const getMyPrescriptions = async (
  user: any,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const result = await prisma.prescription.findMany({
    where: { patientId: patient.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      doctor: true,
      appointment: { include: { schedule: true } },
    },
  });

  const total = await prisma.prescription.count({
    where: { patientId: patient.id },
  });

  return { meta: { total, page, limit }, data: result };
};

const getById = async (id: string): Promise<Prescription | null> => {
  return await prisma.prescription.findUnique({
    where: { id },
    include: {
      items: true,
      doctor: true,
      patient: true,
      appointment: { include: { schedule: true } },
    },
  });
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescriptions,
  getById,
};
