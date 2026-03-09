import { format, addMinutes } from "date-fns";
import prisma from "../../../shared/prisma";
import { Schedule } from "../../../../prisma/generated/prisma";

const inserIntoDB = async (payload: any): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interverlTime = 30;

  const schedules = [];

  const currentDate = new Date(startDate); // start date
  const lastDate = new Date(endDate); // end date

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      `${format(currentDate, "yyyy-MM-dd")}T${startTime}`,
    );
    const endDateTime = new Date(
      `${format(currentDate, "yyyy-MM-dd")}T${endTime}`,
    );
    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, interverlTime),
      };
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + interverlTime);
    }
    currentDate.setDate(currentDate.getDate() + 1); // move to the next day
  }
  return schedules;
};

export const ScheduleService = {
  inserIntoDB,
};
