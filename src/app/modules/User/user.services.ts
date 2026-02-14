import { Patient } from "./../../../../prisma/generated/prisma/index.d";
import { Prisma, PrismaClient, UserRole } from "../../../../generated/prisma";
import * as bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers/fileUploader";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helpers/paginationHelpers";
import { adminSearchableFields } from "../admin/admin.constant";
import { userSearchableFields } from "./user.constant";
const prisma = new PrismaClient();
const createAdmin = async (req: any) => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      file?.path,
    );
    req.body.admin.profilePhoto = uploadToCloudinary?.url;
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
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      file?.path,
    );
    req.body.doctor.profilePhoto = uploadToCloudinary?.url;
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
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(
      file?.path,
    );
    console.log(uploadToCloudinary);
    req.body.patient.profilePhoto = uploadToCloudinary?.url;
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

const getAllUserFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, sortBy, sortOrder, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];
  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive", // for case-insensitive search
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key as keyof typeof filterData],
        },
      })),
    });
  }
  // Apply the filter with the search term
  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {}; // Ensure consistent type
  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? [{ [sortBy]: sortOrder }] : [{ createdAt: "asc" }], // Fallback to 'name' for sorting if not provided
  });
  const total = await prisma.user.count({ where: whereConditions });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
export const UserServices = {
  createAdmin,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUserFromDB,
};
