import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type ProfileHeaderProps = {
  name: string;
  username: string;
  bio?: string;
  avatarUrl: string;
  isVerified?: boolean;
  onEditPress?: () => void;
  onSettingsPress?: () => void;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  username,
  bio,
  avatarUrl,
  isVerified,
  onEditPress,
  onSettingsPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            {isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={20}
                color={colors.primary}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <Text style={[styles.username, { color: colors.text }]}>
            @{username}
          </Text>
          {bio && (
            <Text style={[styles.bio, { color: colors.text }]}>{bio}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onEditPress}
        >
          <Text style={styles.buttonText}>Profili Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={onSettingsPress}
        >
          <MaterialCommunityIcons name="cog" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  username: {
    fontSize: 16,
    marginTop: 2,
    opacity: 0.8,
  },
  bio: {
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
