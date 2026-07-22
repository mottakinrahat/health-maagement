import prisma from "../../../shared/prisma";
import { AppointmentStatus, PaymentStatus, UserRole } from "../../../../prisma/generated/prisma";

const getAdminDashboard = async () => {
  const [
    totalDoctors,
    totalPatients,
    totalAppointments,
    totalRevenue,
    appointmentsByStatus,
  ] = await Promise.all([
    prisma.doctor.count({ where: { isDeleted: false } }),
    prisma.patient.count({ where: { isDeleted: false } }),
    prisma.appointment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.PAID },
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    totalRevenue: totalRevenue._sum.amount || 0,
    appointmentsByStatus: appointmentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
  };
};

const getDoctorDashboard = async (user: any) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  const [
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    canceledAppointments,
    totalPatients,
    totalSchedules,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { doctorId: doctor.id } }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: AppointmentStatus.SCHEDULED },
    }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: AppointmentStatus.COMPLETED },
    }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: AppointmentStatus.CANCELED },
    }),
    prisma.appointment.groupBy({
      by: ["patientId"],
      where: { doctorId: doctor.id },
    }).then((r) => r.length),
    prisma.doctorSchedules.count({ where: { doctorId: doctor.id } }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, status: AppointmentStatus.SCHEDULED },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { patient: true, schedule: true },
    }),
  ]);

  return {
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    canceledAppointments,
    totalPatients,
    totalSchedules,
    upcomingAppointments,
  };
};

const getPatientDashboard = async (user: any) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const [
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    totalPrescriptions,
    totalPayments,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { patientId: patient.id } }),
    prisma.appointment.count({
      where: { patientId: patient.id, status: AppointmentStatus.SCHEDULED },
    }),
    prisma.appointment.count({
      where: { patientId: patient.id, status: AppointmentStatus.COMPLETED },
    }),
    prisma.prescription.count({ where: { patientId: patient.id } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
        appointment: { patientId: patient.id },
      },
    }),
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { doctor: true, schedule: true },
    }),
  ]);

  return {
    totalAppointments,
    scheduledAppointments,
    completedAppointments,
    totalPrescriptions,
    totalAmountSpent: totalPayments._sum.amount || 0,
    recentAppointments,
  };
};

export const DashboardService = {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
};
