import { ScrollView, StyleSheet, View } from "react-native";
import { EventCard } from "./EventCard";
import { B4 } from "../typography/Typography";
import { Event } from "@/src/types";
import { eventColors } from "@/src/constants/EventColors";

const SLOT_HEIGHT = 90;
const MINUTES_PER_SLOT = 60;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / MINUTES_PER_SLOT;

function timeToMinutes(timeStr: string) {
  const [time, meridian] = timeStr.split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (meridian === "AM") {
    if (hour === 12) hour = 0;
  } else if (meridian === "PM") {
    if (hour !== 12) hour += 12;
  }
  return hour * 60 + minute;
}

const baseTimeSlots: string[] = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const timelineMinutes = timeToMinutes("11:00 PM") + 60;
const timelineHeight = timelineMinutes * PIXELS_PER_MINUTE;

export const Timeline = ({ events }: { events: Event[] }) => {
  const eventColorMap = new Map<string, string>();
  events.forEach((ev, idx) => {
    eventColorMap.set(ev.id, eventColors[idx % eventColors.length]);
  });

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ height: timelineHeight }}
    >
      <View style={{ flexDirection: "row", height: timelineHeight }}>
        <View style={{ width: 60 }}>
          {baseTimeSlots.map((slot, idx) => (
            <View
              key={slot}
              style={[styles.timeLabelRow, { height: SLOT_HEIGHT }]}
            >
              <B4 style={styles.timeText}>{slot}</B4>
            </View>
          ))}
        </View>
        <View style={{ flex: 1, position: "relative", height: timelineHeight }}>
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              zIndex: 1,
            }}
          >
            {baseTimeSlots.map((slot, idx) => (
              <View
                key={slot}
                style={{
                  ...styles.slotRow,
                  height: SLOT_HEIGHT,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              />
            ))}
          </View>
          {/* events overlays */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              zIndex: 2,
            }}
          >
            {events.map((ev) => {
              if (!ev.start || !ev.end) return null;
              const eventStartMinutes = timeToMinutes(ev.start);
              const eventEndMinutes = timeToMinutes(ev.end);
              let durationMins = eventEndMinutes - eventStartMinutes;
              if (durationMins <= 0) durationMins += 24 * 60; 
              const top = eventStartMinutes * PIXELS_PER_MINUTE;
              const height = (durationMins * PIXELS_PER_MINUTE) * 2;
              const color = eventColorMap.get(ev.id);

              return (
                <View
                  key={ev.id}
                  style={{
                    position: "absolute",
                    top,
                    left: 0,
                    right: 0,
                    height,
                    zIndex: 2,
                    paddingHorizontal: 4,
                  }}
                >
                  <EventCard
                    event={{ ...ev, color }}
                    style={{ height, borderRadius: 6 }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  timeLabelRow: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  slotRow: {
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "#f8f8f8",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
});
