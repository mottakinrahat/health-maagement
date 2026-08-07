import z from "zod";

const specialitiesValidation = z.object({
    title: z.string({ required_error: "Title is required" }).min(3).max(255)
})

export const specialtiesValidation = {
    specialitiesValidation
}