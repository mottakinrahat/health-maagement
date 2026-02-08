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

export const UserServices = {
  createAdmin,
};
