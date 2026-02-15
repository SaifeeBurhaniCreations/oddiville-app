import api from "@/src/lib/axios";
import { ScheduleEventForm } from "@/app/calendar";
import { CalendarEventResponse } from "@/src/hooks/calendar";

export const createCalendarEvent = async (
  data: ScheduleEventForm
): Promise<CalendarEventResponse> => {
  const response = await api.post('/calendar', data);
  return response.data;
};

export const getAllCalendarEvent = async (): Promise<CalendarEventResponse[]> => {
  const response = await api.get('/calendar');
  return response.data;
};