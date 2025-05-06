import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../constants/theme';

type BadgeType = 'primary' | 'secondary' | 'success' | 'warning';

interface BadgeProps {
  label: string;
  type?: BadgeType;
}

const getBadgeStyle = (type: BadgeType = 'primary') => {
  switch (type) {
    case 'secondary':
      return {backgroundColor: COLORS.secondary};
    case 'success':
      return {backgroundColor: COLORS.success};
    case 'warning':
      return {backgroundColor: COLORS.warning};
    default:
      return {backgroundColor: COLORS.primary};
  }
};

export const Badge: React.FC<BadgeProps> = ({label, type = 'primary'}) => {
  return (
    <View style={[styles.badge, getBadgeStyle(type)]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
    color: COLORS.white,
  },
});
