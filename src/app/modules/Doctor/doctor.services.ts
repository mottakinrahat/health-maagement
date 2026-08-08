import { Prisma, Doctor, UserStatus } from "../../../../prisma/generated/prisma";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IDoctorFilterRequest, IDoctorUpdate } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constants";
import { paginationHelpers } from "../../../helpers/paginationHelpers";

const getAllFromDB = async (
    filters: IDoctorFilterRequest,
    options: IPaginationOptions,   //add pagination
) => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({   //andCondition
            OR: doctorSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    };

    // doctor > doctorSpecialties > specialties -> title

    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    OR: [
                        { specialtiesId: specialties },
                        {
                            specialties: {
                                id: specialties
                            }
                        },
                        {
                            specialties: {
                                title: {
                                    contains: specialties,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    ]
                }
            }
        })
    };


    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key],
            },
        }));
        andConditions.push(...filterConditions);
    }

    andConditions.push({
        isDeleted: false,
    });

    const whereConditions: Prisma.DoctorWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { updatedAt: 'desc' },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            },
           
        },
    });

    const total = await prisma.doctor.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            }
        }
    });
    return result;
};

const updateIntoDB = async (id: string, payload: IDoctorUpdate) => {
    const { specialties, ...doctorData } = payload;

    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        }
    });

    await prisma.$transaction(
        async (transactionClient) => {
            await transactionClient.doctor.update({
                where: {
                    id
                },
                data: doctorData
            });

            if (specialties && specialties.length > 0) {
                // Bulk delete specialties marked with isDeleted
                const deleteSpecialtiesIds = specialties
                    .filter((specialty: any) => specialty.isDeleted)
                    .map((specialty: any) => typeof specialty === "string" ? specialty : specialty.specialtiesId)
                    .filter(Boolean);

                if (deleteSpecialtiesIds.length > 0) {
                    await transactionClient.doctorSpecialties.deleteMany({
                        where: {
                            doctorId: doctorInfo.id,
                            specialtiesId: {
                                in: deleteSpecialtiesIds
                            }
                        }
                    });
                }

                // Parallel upsert for active specialties
                const createSpecialtiesIds = specialties.filter((specialty: any) => !specialty.isDeleted);
                const upsertPromises = createSpecialtiesIds.map((specialty: any) => {
                    const specId = typeof specialty === "string" ? specialty : specialty.specialtiesId;
                    if (!specId) return Promise.resolve();
                    return transactionClient.doctorSpecialties.upsert({
                        where: {
                            specialtiesId_doctorId: {
                                doctorId: doctorInfo.id,
                                specialtiesId: specId
                            }
                        },
                        create: {
                            doctorId: doctorInfo.id,
                            specialtiesId: specId
                        },
                        update: {}
                    });
                });
                await Promise.all(upsertPromises);
            }
        },
        {
            maxWait: 10000,
            timeout: 20000
        }
    );

    const result = await prisma.doctor.findUnique({  //this is for find unique doctor
        where: {
            id: doctorInfo.id
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true
                }
            }
        }
    })
    return result;
};

const deleteFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async transactionClient => {
        const deleteDoctor = await transactionClient.doctor.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: deleteDoctor.email,
            },
        });

        return deleteDoctor;
    });
};

const softDelete = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async transactionClient => {
        const deleteDoctor = await transactionClient.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deleteDoctor;
    });
};



export const DoctorService = {
    updateIntoDB,
    getAllFromDB,
    getByIdFromDB,
    deleteFromDB,
    softDelete
}