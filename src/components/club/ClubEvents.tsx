import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Event = {
  id: string;
  title: string;
  startDate: string;
  location: string;
  participantCount: number;
};

type ClubEventsProps = {
  events: Event[];
  onEventPress?: (eventId: string) => void;
  onViewAllPress?: () => void;
};

export const ClubEvents: React.FC<ClubEventsProps> = ({
  events,
  onEventPress,
  onViewAllPress,
}) => {
  const { colors } = useTheme();

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[styles.eventItem, { backgroundColor: colors.card }]}
      onPress={() => onEventPress?.(item.id)}
    >
      <Text style={[styles.eventTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.eventDate, { color: colors.text }]}>
        {format(new Date(item.startDate), 'd MMMM yyyy', { locale: tr })}
      </Text>
      <Text style={[styles.eventLocation, { color: colors.text }]}>
        {item.location}
      </Text>
      <Text style={[styles.participantCount, { color: colors.text }]}>
        {item.participantCount} katılımcı
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Etkinlikler</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={events.slice(0, 3)}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
  },
  eventsList: {
    gap: 16,
  },
  eventItem: {
    padding: 16,
    borderRadius: 12,
    width: 280,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  participantCount: {
    fontSize: 12,
    opacity: 0.7,
  },
});
