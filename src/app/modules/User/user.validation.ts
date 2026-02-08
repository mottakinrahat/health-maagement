import z from "zod";

const createAdminValidation=z.object({
  password:z.string().min(1, {message:"Password is required"}),
  admin:z.object({
    name:z.string().min(1, {message:"Name is required"}),
    email:z.string().email({message:"Invalid email address"}).min(1, {message:"Email is required"}),
    contactNumber:z.string().min(1, {message:"Phone number is required"}),

  })
})
export const UserValidation={
    createAdminValidation
}