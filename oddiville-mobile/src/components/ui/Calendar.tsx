import { getColor } from "@/src/constants/colors";
import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import LeftChevron from "../icons/navigation/LeftChevron";
import RightChevron from "../icons/navigation/RightChevron";
import { B2, H5 } from "../typography/Typography";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useDispatch } from "react-redux";
import { setCurrentTab } from "@/src/redux/slices/currentCalendarTab.slice";
import { ScheduleEventForm } from "@/app/calendar";
import { CalendarEventResponse } from "@/src/hooks/calendar";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) =>
  new Date(year, month, 1).getDay();

// const getRandomscheduledEvents = (daysInMonth: number, count = 7) => {
//     const days = new Set<number>();
//     while (days.size < count) {
//         days.add(Math.floor(Math.random() * daysInMonth) + 1);
//     }
//     return [...days];
// };

const Calendar = ({
  setSelectedDate,
  selectedDate,
  scheduledEvents,
  ReadableOnly,
}: {
  setSelectedDate: any;
  selectedDate: string;
  scheduledEvents: CalendarEventResponse[] | undefined;
  ReadableOnly?: boolean;
}) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const today = new Date();
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [curYear, setCurYear] = useState(today.getFullYear());

  const { goTo } = useAppNavigation();
  
  const daysInMonth = getDaysInMonth(curMonth, curYear);
  const firstDayOffset = getFirstDayOfMonth(curMonth, curYear);
  const prevLastDay = getDaysInMonth(
    curMonth === 0 ? 11 : curMonth - 1,
    curMonth === 0 ? curYear - 1 : curYear
  );
  const days = [];
  for (let i = 0; i < firstDayOffset; i++) {
    days.push({ type: "prev", date: prevLastDay - (firstDayOffset - 1) + i });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    days.push({ type: "curr", date: d, ymd });
  }
  const total = days?.length;
  for (let i = 1; total + i <= 42; i++) {
    days.push({ type: "next", date: i });
  }

  const goPrevMonth = () => {
    if (curMonth === 0) {
      setCurMonth(11);
      setCurYear(curYear - 1);
    } else {
      setCurMonth(curMonth - 1);
    }
    setSelectedDate("");
  };

  const goNextMonth = () => {
    if (curMonth === 11) {
      setCurMonth(0);
      setCurYear(curYear + 1);
    } else {
      setCurMonth(curMonth + 1);
    }
    setSelectedDate("");
  };

  const todayYMD = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarPadding = 30;
  const gapBetweenCells = 6;
  const gridWidth = width - calendarPadding;

  const cellEmojiSpace = 0.85;
  const dayCellWidth = (gridWidth * cellEmojiSpace - gapBetweenCells * 2.3) / 7;
  const weekdayCellWidth = dayCellWidth;

  const scheduledDays = useMemo(() => {
    if (!Array.isArray(scheduledEvents)) return [];

    return scheduledEvents
      .filter((sd) => {
        const date = new Date(sd.scheduled_date);
        return date.getMonth() === curMonth && date.getFullYear() === curYear;
      })
      .map((sd) => new Date(sd.scheduled_date).getDate());
  }, [scheduledEvents, curMonth, curYear]);

  const scheduledYMD =
    scheduledDays &&
    scheduledDays.map(
      (d) =>
        `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(
          d
        ).padStart(2, "0")}`
    );

  // const scheduledDays = useMemo(
  //     () => getRandomscheduledEvents(daysInMonth, 6),
  //     [curMonth, curYear]
  // );

  // const scheduledYMD = scheduledDays.map(
  //     (d) => `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  // );

  const onEventPress = (day: { ymd: string; type: string; date: number }) => {
    if (day.ymd && scheduledYMD && scheduledYMD.includes(day.ymd)) {
      // console.log("sending events", scheduledEvents);
      
      goTo("calendar-event-detail", {
        date: day.ymd,
        scheduledEvents: Array.isArray(scheduledEvents) ?  JSON.stringify(scheduledEvents) : [],
      });
      dispatch(setCurrentTab(0));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <H5 style={styles.headerText}>
          {MONTH_NAMES[curMonth]} {curYear}
        </H5>
        <View style={styles.arrowBtns}>
          <TouchableOpacity onPress={goPrevMonth} style={styles.arrowBtn}>
            <LeftChevron />
          </TouchableOpacity>
          <TouchableOpacity onPress={goNextMonth} style={styles.arrowBtn}>
            <RightChevron />
          </TouchableOpacity>
        </View>
      </View>
      {/* Days of Week Row */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day, idx) => (
          <B2
            key={`week-${day}-${idx}`}
            style={[styles.weekText, { width: weekdayCellWidth }]}
          >
            {day}
          </B2>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {days.map((day, idx) => {
          const isSelected = day.ymd && day.ymd === selectedDate;
          const isToday = day.ymd && day.ymd === todayYMD;
          const isScheduled =
            day.ymd && scheduledYMD && scheduledYMD.includes(day.ymd);
          const isPastDay =
            day.type === "curr" &&
            (curYear < today.getFullYear() ||
              (curYear === today.getFullYear() &&
                curMonth < today.getMonth()) ||
              (curYear === today.getFullYear() &&
                curMonth === today.getMonth() &&
                day.date < today.getDate()));

          return (
            <TouchableOpacity
              key={`day-${idx}`}
              style={[
                styles.dayCell,
                day.type !== "curr" && styles.dimmedDay,
                isPastDay && { opacity: 0.4 },
                !ReadableOnly && isSelected && styles.selectedDay,
                isToday && styles.todayDay,
                isScheduled && styles.scheduledDay,
                {
                  width: dayCellWidth,
                  height: dayCellWidth,
                  borderRadius: dayCellWidth / 2,
                },
              ]}
              disabled={day.type !== "curr" || isPastDay}
              onPress={() => {
                if (day.ymd) {
                  setSelectedDate(day.ymd);
                  onEventPress(day);
                }
              }}
            >
              <B2
                style={[
                  styles.dayText,
                  day.type !== "curr" && styles.dayTextDim,
                  isToday && styles.todayDayText,
                  !ReadableOnly && isSelected && styles.selectedDayText,
                  isScheduled && styles.scheduledDayText,
                ]}
              >
                {day.date}
              </B2>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: getColor("light"),
    padding: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerText: {
    color: getColor("green"),
  },
  arrowBtns: { flexDirection: "row", gap: 12 },
  arrowBtn: { padding: 4 },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekText: {
    textAlign: "center",
    color: getColor("green", 700),
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    marginHorizontal: 2,
  },
  dayText: {
    color: getColor("green", 700),
  },
  dimmedDay: {
    backgroundColor: "transparent",
  },
  dayTextDim: {
    color: getColor("green", 200),
  },
  selectedDay: {
    backgroundColor: getColor("green"),
    borderWidth: 1,
    borderColor: getColor("green"),
  },
  scheduledDay: {
    backgroundColor: getColor("blue"),
    borderWidth: 1,
    borderColor: getColor("blue"),
  },
  scheduledDayText: {
    color: getColor("light"),
  },
  selectedDayText: {
    color: getColor("light"),
  },
  todayDay: {
    borderWidth: 1,
    borderColor: getColor("green"),
  },
  todayDayText: {
    color: getColor("green"),
    fontWeight: "bold",
  },
});
