import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    location: string;
    club: {
      id: string;
      name: string;
      logoUrl?: string;
    };
    participantCount: number;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const formatDate = (date: string) => {
    return format(new Date(date), 'd MMMM yyyy, HH:mm', { locale: tr });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      {/* Kulüp Bilgisi */}
      <TouchableOpacity
        style={styles.clubContainer}
        onPress={() =>
          navigation.navigate('ClubDetail', { clubId: event.club.id })
        }
      >
        <Image
          source={
            event.club.logoUrl
              ? { uri: event.club.logoUrl }
              : require('../assets/default-club-logo.png')
          }
          style={styles.clubLogo}
        />
        <Text style={[styles.clubName, { color: colors.text }]}>
          {event.club.name}
        </Text>
      </TouchableOpacity>

      {/* Etkinlik Görseli */}
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}

      {/* Etkinlik Detayları */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          {event.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.text }]}
          numberOfLines={2}
        >
          {event.description}
        </Text>

        {/* Tarih ve Konum */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatDate(event.startDate)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {event.location}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="account-group"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {event.participantCount} katılımcı
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubContainer: {
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
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
});

export default EventCard;
