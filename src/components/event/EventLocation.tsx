import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type EventLocationProps = {
  location: string;
  onDirectionsPress?: () => void;
};

export const EventLocation: React.FC<EventLocationProps> = ({
  location,
  onDirectionsPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.locationInfo}>
        <Icon name="map-marker" size={24} color={colors.primary} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {location}
        </Text>
      </View>
      {onDirectionsPress && (
        <TouchableOpacity
          style={[styles.directionsButton, { borderColor: colors.primary }]}
          onPress={onDirectionsPress}
        >
          <Icon name="directions" size={20} color={colors.primary} />
          <Text style={[styles.directionsText, { color: colors.primary }]}>
            Yol Tarifi Al
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  directionsText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});
