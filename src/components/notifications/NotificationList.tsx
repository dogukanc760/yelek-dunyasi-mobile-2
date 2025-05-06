import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { NotificationItem } from './NotificationItem';

type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'event' | 'club';
  title: string;
  message: string;
  timestamp: string;
  userAvatar?: string;
  isRead: boolean;
};

type NotificationListProps = {
  notifications: Notification[];
  onNotificationPress?: (notificationId: string) => void;
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
}) => {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          {...item}
          onPress={() => onNotificationPress?.(item.id)}
        />
      )}
      style={styles.container}
      contentContainerStyle={styles.content}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
});
