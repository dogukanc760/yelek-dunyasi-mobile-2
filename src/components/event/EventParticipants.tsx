import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
};

type EventParticipantsProps = {
  participants: Participant[];
  maxParticipants?: number;
};

export const EventParticipants: React.FC<EventParticipantsProps> = ({
  participants,
  maxParticipants,
}) => {
  const { colors } = useTheme();

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      <Text style={[styles.participantName, { color: colors.text }]}>
        {item.firstName} {item.lastName}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Katılımcılar</Text>
        {maxParticipants && (
          <Text style={[styles.count, { color: colors.text }]}>
            {participants.length} / {maxParticipants}
          </Text>
        )}
      </View>
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.list}
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
  count: {
    fontSize: 14,
    opacity: 0.7,
  },
  list: {
    gap: 16,
  },
  participantItem: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
