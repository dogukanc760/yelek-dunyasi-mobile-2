import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ClubHeaderProps = {
  name: string;
  description: string;
  logoUrl: string;
  coverPhotoUrl: string;
  memberCount: number;
  onEditPress?: () => void;
};

export const ClubHeader: React.FC<ClubHeaderProps> = ({
  name,
  description,
  logoUrl,
  coverPhotoUrl,
  memberCount,
  onEditPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Image source={{ uri: coverPhotoUrl }} style={styles.coverPhoto} />
      <View style={styles.content}>
        <Image source={{ uri: logoUrl }} style={styles.logo} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {description}
          </Text>
          <Text style={[styles.memberCount, { color: colors.text }]}>
            {memberCount} üye
          </Text>
        </View>
        {onEditPress && (
          <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
            <Text style={[styles.editText, { color: colors.primary }]}>
              Düzenle
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -40,
    borderWidth: 4,
    borderColor: 'white',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  memberCount: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.6,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
