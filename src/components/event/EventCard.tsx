import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type EventCardProps = {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    startDate: string;
    location: string;
    participantCount: number;
    club: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
  onPress?: () => void;
};

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Image source={{ uri: event.club.logoUrl }} style={styles.clubLogo} />
        <Text style={[styles.clubName, { color: colors.text }]}>
          {event.club.name}
        </Text>
      </View>

      {event.imageUrl && (
        <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {event.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.text }]}
          numberOfLines={2}
        >
          {event.description}
        </Text>

        <View style={styles.details}>
          <Text style={[styles.date, { color: colors.text }]}>
            {format(new Date(event.startDate), 'd MMMM yyyy', { locale: tr })}
          </Text>
          <Text style={[styles.location, { color: colors.text }]}>
            {event.location}
          </Text>
          <Text style={[styles.participants, { color: colors.text }]}>
            {event.participantCount} katılımcı
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  clubLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  clubName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    gap: 4,
  },
  date: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
  },
  participants: {
    fontSize: 14,
    opacity: 0.7,
  },
});
