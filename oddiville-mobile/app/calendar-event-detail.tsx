import { StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "@/src/hooks/useParams";
import Tabs from "@/src/components/ui/Tabs";
import { Timeline } from "@/src/components/ui/TimeLine";
import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import { format } from "date-fns";
import { Event } from "@/src/types";
import Calendar from "@/src/components/ui/Calendar";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { transformArray } from "@/src/sbc/utils/arrayTransformer/arrayTransformer";

const CalendarDetailScreen = () => {
  const { date, scheduledEvents } = useParams(
    "calendar-event-detail",
    "date",
    "scheduledEvents"
  );

  const [selectedDate, setSelectedDate] = useState<string>("");
  const eventsArray =
    scheduledEvents && Array.isArray(JSON.parse(scheduledEvents))
      ? JSON.parse(scheduledEvents)
      : [];

  const formatDisplayedEvents = transformArray(eventsArray, {
    filter: (ev) => {
      try {
        const evDateObj = new Date(ev.scheduled_date);
        const selDateObj = date ? new Date(date) : new Date();

        return (
          format(evDateObj, "dd MMM yyyy") === format(selDateObj, "dd MMM yyyy")
        );
      } catch {
        return false;
      }
    },
    propertyMap: {
      product_name: "title",
      start_time: "start",
      end_time: "end",
    },
    map: (item) => ({
      ...item,
      message: `${item.title} is currently being processed in ${item.work_area}.`,
    }),
    storeMode: "state",
  }) as Event[];

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Calendar"} />
      <View style={styles.container}>
        <BackButton label="Calendar" backRoute="calendar" />
        <Tabs
          tabTitles={["Day", "Month"]}
          style={[styles.flexGrow, { flexDirection: "column", gap: 24 }]}
        >
          <View style={styles.flexGrow}>
            <Timeline events={formatDisplayedEvents} />
          </View>
          <View style={styles.flexGrow}>
            <Calendar
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              scheduledEvents={eventsArray}
              ReadableOnly
            />
          </View>
        </Tabs>
      </View>
    </View>
  );
};

export default CalendarDetailScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
