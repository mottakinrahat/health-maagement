import { Patient } from './../../../../prisma/generated/prisma/index.d';
import { PrismaClient, UserRole } from "../../../../generated/prisma";
import * as bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers/fileUploader";
const prisma = new PrismaClient();
const createAdmin = async (req: any) => {
const file=req.file;
if(file){
  const uploadToCloudinary=await fileUploader.uploadToCloudinary(file?.path);
  req.body.admin.profilePhoto=uploadToCloudinary?.url;
}
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  const result = await prisma.$transaction(async (transactionClient: any) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });
    return createdAdminData;
  });
  return result;
};
const createDoctorIntoDB = async (req: any) => {
const file=req.file;
if(file){
  const uploadToCloudinary=await fileUploader.uploadToCloudinary(file?.path);
  req.body.doctor.profilePhoto=uploadToCloudinary?.url;
}
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };
  const result = await prisma.$transaction(async (transactionClient: any) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });
    return createdDoctorData;
  });
  return result;
};


const createPatientIntoDB = async (req: any) => {
const file=req.file;

if(file){
  const uploadToCloudinary=await fileUploader.uploadToCloudinary(file?.path);
  console.log(uploadToCloudinary);
  req.body.patient.profilePhoto=uploadToCloudinary?.url;
}
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };
  const result = await prisma.$transaction(async (transactionClient: any) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdPatientData = await transactionClient.Patient.create({
      data: req.body.patient,
    });
    return createdPatientData;
  });
  return result;
};
export const UserServices = {
  createAdmin,createDoctorIntoDB,createPatientIntoDB
};
