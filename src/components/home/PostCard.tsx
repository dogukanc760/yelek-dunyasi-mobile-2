import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';

type PostCardProps = {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
};

export const PostCard: React.FC<PostCardProps> = ({
  content,
  imageUrl,
  author,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        {author.avatar && (
          <Image source={{ uri: author.avatar }} style={styles.avatar} />
        )}
        <Text style={[styles.authorName, { color: colors.text }]}>
          {author.name}
        </Text>
      </View>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      <Text style={[styles.content, { color: colors.text }]}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});
