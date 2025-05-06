import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

type Comment = {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
  };
};

type PostCommentsProps = {
  comments: Comment[];
  onViewAllComments?: () => void;
};

export const PostComments: React.FC<PostCommentsProps> = ({
  comments,
  onViewAllComments,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {comments.slice(0, 2).map((comment) => (
        <Text key={comment.id} style={[styles.comment, { color: colors.text }]}>
          <Text style={styles.author}>{comment.author.name}</Text>{' '}
          {comment.text}
        </Text>
      ))}
      {comments.length > 2 && (
        <TouchableOpacity onPress={onViewAllComments}>
          <Text style={[styles.viewAll, { color: colors.text }]}>
            Tüm yorumları gör ({comments.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  comment: {
    fontSize: 14,
    marginBottom: 4,
  },
  author: {
    fontWeight: '600',
  },
  viewAll: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
});
