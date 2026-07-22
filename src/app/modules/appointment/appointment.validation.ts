import { z } from "zod";

const create = z.object({
  body: z.object({
    doctorId: z.string({ required_error: "Doctor ID is required" }),
    scheduleId: z.string({ required_error: "Schedule ID is required" }),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["SCHEDULED", "INPROGRESS", "COMPLETED", "CANCELED"]),
  }),
});

export const AppointmentValidation = { create, updateStatus };
