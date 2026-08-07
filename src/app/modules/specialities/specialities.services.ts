import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";

const createSpecialtiesIntoDB = async (req:any) => {
const file = req.file ;
if(file){
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file.path);
    req.body.icon = uploadToCloudinary.url;
}
const createSpecialties=await prisma.specialties.create({
    data:req.body
})
return createSpecialties;
}

const getAllFromDB = async () => {
  return await prisma.specialties.findMany();
};

const deleteFromDB = async (id: string) => {
  return await prisma.specialties.delete({
    where: { id },
  });
};

export const SpecialitiesServices = {                                              
    createSpecialtiesIntoDB,
    getAllFromDB,
    deleteFromDB,
}