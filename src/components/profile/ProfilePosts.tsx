import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

type Post = {
  id: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
};

type ProfilePostsProps = {
  posts: Post[];
  onPostPress?: (postId: string) => void;
};

export const ProfilePosts: React.FC<ProfilePostsProps> = ({
  posts,
  onPostPress,
}) => {
  const { colors } = useTheme();

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => onPostPress?.(item.id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={styles.postStats}>
        <Text style={[styles.statText, { color: colors.text }]}>
          {item.likeCount} beğeni
        </Text>
        <Text style={[styles.statText, { color: colors.text }]}>
          {item.commentCount} yorum
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Gönderiler</Text>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.postsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  postsContainer: {
    padding: 4,
  },
  postContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  postImage: {
    flex: 1,
    borderRadius: 8,
  },
  postStats: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: 'white',
  },
});
