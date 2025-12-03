import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScheduleEventForm } from "@/app/calendar";
import { useEffect } from "react";
import { rejectEmptyOrNull } from "../utils/authUtils";
import { getAllCalendarEvent } from '../services/calendar.service';
import useSocket from './useSocketFromContext';

export type CalendarEventResponse = ScheduleEventForm & {
    id: string;
};

export interface CalendarCreated {
    calendarEventDetails: CalendarEventResponse;
    timestamp?: string | Date;
    type?: string;
}

export function useCalendar() {
    const socket = useSocket();
    const queryClient = useQueryClient();
    useEffect(() => {
        const onCreated = (data: CalendarCreated) => {
            const updated = data.calendarEventDetails;
            if (!updated?.id) return;

            queryClient.setQueryData<CalendarEventResponse>(['calendar-by-id', updated.id], updated);
            queryClient.setQueryData<CalendarEventResponse[]>(['calendar'], (old) => {
                if (!old) return [updated];
                if (old.some(o => o.id === updated.id)) return old;
                return [updated, ...old];
            });
        };

        socket.on('calendar:created', onCreated);
        return () => {
            socket.off('calendar:created', onCreated);
        };
    }, [queryClient]);

    return useQuery<CalendarEventResponse[]>({
        queryKey: ['calendar'],
        queryFn: rejectEmptyOrNull(async () => {
            const response = await getAllCalendarEvent();
            return response.data;
        }),
    });
}