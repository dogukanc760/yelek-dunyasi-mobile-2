import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { NotificationList } from './NotificationList';

type ActivityFeedProps = {
  activities: Array<{
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'event' | 'club';
    title: string;
    message: string;
    timestamp: string;
    userAvatar?: string;
    isRead: boolean;
  }>;
  onActivityPress?: (activityId: string) => void;
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onActivityPress,
}) => {
  const { colors } = useTheme();

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Henüz aktivite yok
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationList
        notifications={activities}
        onNotificationPress={onActivityPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
});
