import {
  Appointment,
  AppointmentStatus,
  Prisma,
  UserRole,
} from "../../../../prisma/generated/prisma";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IAppointmentCreate, IAppointmentFilterRequest } from "./appointment.interface";
import { randomUUID } from "crypto";

const createAppointment = async (
  user: any,
  payload: IAppointmentCreate
): Promise<Appointment> => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  // Ensure the doctor schedule slot is not already booked
  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  return await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        videoCallingId: randomUUID(),
      },
      include: {
        doctor: true,
        patient: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: { isBooked: true, appointmentId: appointment.id },
    });

    return appointment;
  });
};

const getAllFromDB = async (
  filters: IAppointmentFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });

  const total = await prisma.appointment.count({ where: whereConditions });

  return { meta: { total, page, limit }, data: result };
};

const getMyAppointments = async (
  user: any,
  filters: IAppointmentFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user.role === UserRole.PATIENT) {
    const patient = await prisma.patient.findUniqueOrThrow({
      where: { email: user.email },
    });
    andConditions.push({ patientId: patient.id });
  } else if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: { email: user.email },
    });
    andConditions.push({ doctorId: doctor.id });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      schedule: true,
      prescription: { include: { items: true } },
    },
  });

  const total = await prisma.appointment.count({ where: whereConditions });

  return { meta: { total, page, limit }, data: result };
};

const updateStatus = async (
  id: string,
  status: AppointmentStatus,
  user: any
): Promise<Appointment> => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id },
    include: { doctor: true },
  });

  if (
    user.role === UserRole.DOCTOR &&
    appointment.doctor.email !== user.email
  ) {
    throw new Error("You are not authorized to update this appointment");
  }

  return await prisma.appointment.update({
    where: { id },
    data: { status },
  });
};

const cancelAppointment = async (id: string): Promise<Appointment> => {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id },
  });

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELED },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: appointment.doctorId,
          scheduleId: appointment.scheduleId,
        },
      },
      data: { isBooked: false, appointmentId: null },
    });

    return updated;
  });
};

export const AppointmentService = {
  createAppointment,
  getAllFromDB,
  getMyAppointments,
  updateStatus,
  cancelAppointment,
};
