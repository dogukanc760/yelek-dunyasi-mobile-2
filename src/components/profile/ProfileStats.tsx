import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ProfileStatsProps = {
  clubCount: number;
  eventCount: number;
  followersCount: number;
  followingCount: number;
  onClubsPress?: () => void;
  onEventsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
};

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  clubCount,
  eventCount,
  followersCount,
  followingCount,
  onClubsPress,
  onEventsPress,
  onFollowersPress,
  onFollowingPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity style={styles.statItem} onPress={onClubsPress}>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {clubCount}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>Kulüp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem} onPress={onEventsPress}>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {eventCount}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>Etkinlik</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem} onPress={onFollowersPress}>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {followersCount}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>Takipçi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem} onPress={onFollowingPress}>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {followingCount}
        </Text>
        <Text style={[styles.statLabel, { color: colors.text }]}>Takip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
