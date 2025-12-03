import { View, StyleSheet } from 'react-native';
import { B6, C1 } from '../typography/Typography';
import { Event } from '@/src/types';
import { format } from 'date-fns';

export const EventCard = ({
  event,
  style,
  ...props
}: {
  event: Event;
  style?: any;
}) => (
  <View
    style={[styles.card, { backgroundColor: event.color }, style]}
    {...props}
  >
    <View style={styles.header}>
      {/* <H5>{event.title}</H5> */}
      <C1 style={styles.duration}>
        {`${format(
          new Date(event?.scheduled_date ?? new Date()),
          "dd MMM yyyy"
        )}`}
      </C1>
    </View>
    {event.message && (
      <View style={styles.message}>
        <B6 style={styles.tag}>{event.message}</B6>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
    card: { borderRadius: 16, marginVertical: 8, padding: 10, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between' },
    duration: { fontSize: 16, opacity: 0.8 },
    avatars: { flexDirection: 'row' },
    avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
    message: { flexDirection: 'row', marginVertical: 8 },
    tag: { backgroundColor: '#0A493B1A', borderRadius: 8, padding: 6, marginRight: 4 }
});
