import { z } from "zod";

const prescriptionItemSchema = z.object({
  medicineName: z.string({ required_error: "Medicine name is required" }),
  dosage: z.string({ required_error: "Dosage is required" }),
  frequency: z.string({ required_error: "Frequency is required" }),
  duration: z.string({ required_error: "Duration is required" }),
  notes: z.string().optional(),
});

const create = z.object({
  body: z.object({
    appointmentId: z.string({ required_error: "Appointment ID is required" }),
    instructions: z.string().optional(),
    followUpDate: z.string().optional(),
    items: z
      .array(prescriptionItemSchema)
      .min(1, "At least one medicine is required"),
  }),
});

export const PrescriptionValidation = { create };
