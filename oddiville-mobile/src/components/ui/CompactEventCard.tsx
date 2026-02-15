import { View, StyleSheet } from 'react-native';
import { B3, B6 } from '../typography/Typography';
import { Event } from '@/src/types';
import { format } from 'date-fns';

export const CompactEventCard = ({
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
      <B3>{event.title} | </B3>
      <B6>{`${format(
          new Date(event?.scheduled_date ?? new Date()),
          "dd MMM yyyy"
        )}`}</B6>
  </View>
);

const styles = StyleSheet.create({
    card: { borderRadius: 16, marginVertical: 8, padding: 8, elevation: 2, flexDirection: 'row', alignItems: 'center' },
});
