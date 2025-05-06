import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type EventDetailsProps = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  participantCount: number;
  maxParticipants?: number;
};

export const EventDetails: React.FC<EventDetailsProps> = ({
  title,
  description,
  startDate,
  endDate,
  location,
  participantCount,
  maxParticipants,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tarih ve Saat
        </Text>
        <Text style={[styles.dateText, { color: colors.text }]}>
          Başlangıç:{' '}
          {format(new Date(startDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
        </Text>
        <Text style={[styles.dateText, { color: colors.text }]}>
          Bitiş:{' '}
          {format(new Date(endDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Konum</Text>
        <Text style={[styles.locationText, { color: colors.text }]}>
          {location}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Katılımcılar
        </Text>
        <Text style={[styles.participantText, { color: colors.text }]}>
          {participantCount} katılımcı
          {maxParticipants ? ` / ${maxParticipants} kontenjan` : ''}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Detaylar
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {description}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
  },
  participantText: {
    fontSize: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
