import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { IPaginationOptions } from "../../interfaces/pagination";

const insertIntoDB = async (user: any, payload: { scheduleIds: string[] }) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctor.id,
    scheduleId,
  }));

  return await prisma.doctorSchedules.createMany({ data: doctorScheduleData });
};

const getMySchedules = async (user: any, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const result = await prisma.doctorSchedules.findMany({
    where: { doctorId: doctor.id },
    skip,
    take: limit,
    include: { schedule: true },
  });

  const total = await prisma.doctorSchedules.count({
    where: { doctorId: doctor.id },
  });

  return { meta: { total, page, limit }, data: result };
};

const getAllFromDB = async (
  filters: { doctorId?: string; isBooked?: boolean },
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const whereConditions: any = {};
  if (filters.doctorId) whereConditions.doctorId = filters.doctorId;
  if (filters.isBooked !== undefined) {
    whereConditions.isBooked = filters.isBooked === true || (filters.isBooked as any) === "true";
  }

  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: { doctor: true, schedule: true },
  });

  const total = await prisma.doctorSchedules.count({ where: whereConditions });

  return { meta: { total, page, limit }, data: result };
};

const deleteFromDB = async (user: any, scheduleId: string) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  return await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: { doctorId: doctor.id, scheduleId },
    },
  });
};

export const DoctorScheduleService = {
  insertIntoDB,
  getMySchedules,
  getAllFromDB,
  deleteFromDB,
};