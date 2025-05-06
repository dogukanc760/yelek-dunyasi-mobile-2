import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PostActionsProps = {
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
};

export const PostActions: React.FC<PostActionsProps> = ({
  onLike,
  onComment,
  onShare,
  isLiked,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLike} style={styles.actionButton}>
        <Icon
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? colors.primary : colors.text}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onComment} style={styles.actionButton}>
        <Icon name="comment-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onShare} style={styles.actionButton}>
        <Icon name="share-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    marginRight: 16,
  },
});
