import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLanes } from "../services/lane.service";
import { fetchLocations } from "../services/worklocation.service";
import { useEffect, useMemo } from "react";
import { socket } from "../lib/notificationSocket";
import { rejectEmptyOrNull } from "../utils/authUtils";
import { Lane, LaneDTO } from "../types/lanes.dto";
import { mapLane } from "../mappers/mapLane";
import { AxiosResponse } from "axios";
import { LocationDTO } from "../types/location.dto";

export function useLanes() {
  const queryClient = useQueryClient();

  const query = useQuery<Lane[]>({
    queryKey: ["lanes-data"],
    queryFn: rejectEmptyOrNull(async () => {
      const res = await fetchLanes();
      return (res.data as LaneDTO[]).map(mapLane);
    }),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  useEffect(() => {
    const listener = (data: { lanes: LaneDTO[] }) => {
      if (data?.lanes) {
        queryClient.setQueryData(["lanes-data"], data.lanes.map(mapLane));
      }
    };

    socket.on("lanes:receive", listener);
    return () => {
      socket.off("lanes:receive", listener);
    };
  }, [queryClient]);

  return query;
}

export function useLaneById(laneId: string) {
  const { data: lanes, ...rest } = useLanes();

  const lane = useMemo(() => {
    if (!lanes || !laneId) return undefined;
    return lanes.find((lane: Lane) => lane.id === laneId);
  }, [lanes, laneId]);

  return { lane, lanes, ...rest };
}

export const useLocations = () =>
  useQuery<LocationDTO[]>({
    queryKey: ['work-locations'],
    queryFn: rejectEmptyOrNull(fetchLocations),
    staleTime: 1000 * 60 * 2400,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });