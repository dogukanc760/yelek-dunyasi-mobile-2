import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type EventActionsProps = {
  isParticipating: boolean;
  onParticipate?: () => void;
  onShare?: () => void;
  isDisabled?: boolean;
};

export const EventActions: React.FC<EventActionsProps> = ({
  isParticipating,
  onParticipate,
  onShare,
  isDisabled,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.participateButton,
          {
            backgroundColor: isParticipating
              ? colors.background
              : colors.primary,
            borderColor: colors.primary,
          },
        ]}
        onPress={onParticipate}
        disabled={isDisabled}
      >
        <Icon
          name={isParticipating ? 'check' : 'plus'}
          size={20}
          color={isParticipating ? colors.primary : colors.background}
        />
        <Text
          style={[
            styles.participateText,
            { color: isParticipating ? colors.primary : colors.background },
          ]}
        >
          {isParticipating ? 'Katılıyorsun' : 'Katıl'}
        </Text>
      </TouchableOpacity>

      {onShare && (
        <TouchableOpacity
          style={[styles.shareButton, { borderColor: colors.border }]}
          onPress={onShare}
        >
          <Icon name="share-variant" size={20} color={colors.text} />
          <Text style={[styles.shareText, { color: colors.text }]}>Paylaş</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  participateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  participateText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: 100,
  },
  shareText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
