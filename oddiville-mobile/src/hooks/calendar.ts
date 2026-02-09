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
    if (!socket) return;

    const onCreated = (updated: CalendarEventResponse) => {
      if (!updated?.id) return;

      queryClient.setQueryData(
        ['calendar-by-id', updated.id],
        updated
      );

      queryClient.setQueryData<CalendarEventResponse[]>(
        ['calendar'],
        (old = []) => {
          if (old.some(e => e.id === updated.id)) return old;
          return [updated, ...old];
        }
      );
    };

    socket.on('calendar:created', onCreated);

    return () => {
      socket.off('calendar:created', onCreated);
    };
  }, [socket, queryClient]);

  return useQuery<CalendarEventResponse[]>({
    queryKey: ['calendar'],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await getAllCalendarEvent();
      return response.data;
    }),
  });
}
