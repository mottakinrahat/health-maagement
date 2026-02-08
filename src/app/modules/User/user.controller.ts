import { Request, Response } from "express";
import { UserServices } from "./user.services";

const createAdminUser = async (req:Request,res:Response) => {

try {
    const result = await UserServices.createAdmin(req);
    res.status(200).json({
        success: true,
        message: "Admin user created successfully",
        data: result
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: "Failed to create admin user",
        error: error
    });
}
};
const createDoctor = async (req:Request,res:Response) => {
try {
    const result = await UserServices.createDoctorIntoDB(req);
    res.status(200).json({
        success: true,
        message: "Doctor created successfully",
        data: result
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: "Failed to create Doctor",
        error: error
    });
}
};
export const UserController = {
  createAdminUser,createDoctor
};
