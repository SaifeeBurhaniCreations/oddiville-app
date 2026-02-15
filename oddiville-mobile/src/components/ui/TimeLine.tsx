import { ScrollView, StyleSheet, View } from "react-native";
import { FullEventCard } from "./FullEventCard";
import { B4 } from "../typography/Typography";
import { Event } from "@/src/types";
import { eventColors } from "@/src/constants/EventColors";
import { CompactEventCard } from "./CompactEventCard";

const SLOT_HEIGHT = 90;
const LABEL_BASELINE_OFFSET = 8;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / 60;
const COMPACT_THRESHOLD = 60;
const TINY_THRESHOLD = 28;

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
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", minHeight: timelineHeight }}>
        <View style={{ width: 60 }}>
          {baseTimeSlots.map((slot) => (
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
            {baseTimeSlots.map((slot) => (
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

              const startMin = timeToMinutes(ev.start);
              const endMin = timeToMinutes(ev.end);

              const crossesMidnight = endMin <= startMin;

              let duration = endMin - startMin;
              if (duration <= 0) duration += 24 * 60;

              const top = Math.round(startMin * PIXELS_PER_MINUTE - LABEL_BASELINE_OFFSET);

              const height = Math.round(duration * PIXELS_PER_MINUTE);

              const color = eventColorMap.get(ev.id);

              const isCompact = height < COMPACT_THRESHOLD;

              let segments = [];

              if (!crossesMidnight) {
                segments.push({ start: startMin, end: endMin });
              } else {
                // part 1: today till 24:00
                segments.push({ start: startMin, end: 1440 });

                // part 2: next day from 00:00
                segments.push({ start: 0, end: endMin });
              }
              return segments.map((seg, index) => {
                const duration = seg.end - seg.start;

                const top = Math.round(seg.start * PIXELS_PER_MINUTE - LABEL_BASELINE_OFFSET);
                const height = Math.round(duration * PIXELS_PER_MINUTE);
                const color = eventColorMap.get(ev.id);

                const isCompact = height < COMPACT_THRESHOLD;

                return (
                  <View
                    key={`${ev.id}-${index}`}
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
                    {isCompact ? (
                      <CompactEventCard event={{ ...ev, color }} style={{ height, borderRadius: 6 }} />
                    ) : (
                      <FullEventCard event={{ ...ev, color }} style={{ height, borderRadius: 6 }} />
                    )}
                  </View>
                );
              });

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