import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'event'
  | 'club';

type NotificationItemProps = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  userAvatar?: string;
  isRead: boolean;
  onPress?: () => void;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  message,
  timestamp,
  userAvatar,
  isRead,
  onPress,
}) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'comment-text';
      case 'follow':
        return 'account-plus';
      case 'mention':
        return 'at';
      case 'event':
        return 'calendar';
      case 'club':
        return 'account-group';
      default:
        return 'bell';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isRead ? colors.background : colors.card },
      ]}
      onPress={onPress}
    >
      {userAvatar ? (
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
      ) : (
        <View
          style={[styles.iconContainer, { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons name={getIcon()} size={24} color="white" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.message, { color: colors.text }]}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Text style={[styles.timestamp, { color: colors.text }]}>
          {timestamp}
        </Text>
      </View>

      {!isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
