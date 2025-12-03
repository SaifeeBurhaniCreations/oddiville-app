import api from "@/src/lib/axios";
import { ScheduleEventForm } from "@/app/calendar";

export const createCalendarEvent = async (data: ScheduleEventForm) => {
    return await api.post('/calendar', data);
}

export const getAllCalendarEvent = async () => {
    return await api.get('/calendar');
}