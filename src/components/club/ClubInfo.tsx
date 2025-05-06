import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ClubInfoProps = {
  type: 'PROFESSIONAL' | 'AMATEUR' | 'SOCIAL';
  city: string;
  district: string;
  isPrivate: boolean;
};

export const ClubInfo: React.FC<ClubInfoProps> = ({
  type,
  city,
  district,
  isPrivate,
}) => {
  const { colors } = useTheme();

  const getClubTypeText = () => {
    switch (type) {
      case 'PROFESSIONAL':
        return 'Profesyonel Kulüp';
      case 'AMATEUR':
        return 'Amatör Kulüp';
      case 'SOCIAL':
        return 'Sosyal Kulüp';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="account-group"
          size={20}
          color={colors.text}
        />
        <Text style={[styles.infoText, { color: colors.text }]}>
          {getClubTypeText()}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="map-marker"
          size={20}
          color={colors.text}
        />
        <Text style={[styles.infoText, { color: colors.text }]}>
          {city}, {district}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name={isPrivate ? 'lock' : 'lock-open'}
          size={20}
          color={colors.text}
        />
        <Text style={[styles.infoText, { color: colors.text }]}>
          {isPrivate ? 'Özel Kulüp' : 'Herkese Açık'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
