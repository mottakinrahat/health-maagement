import status from "http-status";
import { sendResponse } from "../../../helpers/sendResponse";
import { catchAsync } from "../../../helpers/trycatch";
import { SpecialitiesServices } from "./specialities.services";

const createSpecialties = catchAsync(async (req, res) => {
  const result = await SpecialitiesServices.createSpecialtiesIntoDB(req);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Specialties created successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req, res) => {
  const result = await SpecialitiesServices.getAllFromDB();

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Specialties fetched successfully",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SpecialitiesServices.deleteFromDB(id as string);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtiesController = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialty,
};
