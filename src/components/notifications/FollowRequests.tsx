import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type FollowRequest = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  timestamp: string;
};

type FollowRequestsProps = {
  requests: FollowRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onUserPress: (requestId: string) => void;
};

export const FollowRequests: React.FC<FollowRequestsProps> = ({
  requests,
  onAccept,
  onReject,
  onUserPress,
}) => {
  const { colors } = useTheme();

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Bekleyen takip isteği yok
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {requests.map((request) => (
        <View
          key={request.id}
          style={[styles.requestItem, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => onUserPress(request.id)}
          >
            <Image source={{ uri: request.avatarUrl }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={[styles.name, { color: colors.text }]}>
                {request.name}
              </Text>
              <Text style={[styles.username, { color: colors.text }]}>
                @{request.username}
              </Text>
              <Text style={[styles.timestamp, { color: colors.text }]}>
                {request.timestamp}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAccept(request.id)}
            >
              <MaterialCommunityIcons name="check" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(request.id)}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  requestItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    marginBottom: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
});
