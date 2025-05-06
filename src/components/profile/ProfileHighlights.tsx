import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

type Highlight = {
  id: string;
  title: string;
  coverUrl: string;
};

type ProfileHighlightsProps = {
  highlights: Highlight[];
  onHighlightPress?: (highlightId: string) => void;
};

export const ProfileHighlights: React.FC<ProfileHighlightsProps> = ({
  highlights,
  onHighlightPress,
}) => {
  const { colors } = useTheme();

  if (highlights.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Öne Çıkanlar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.highlightsContainer}
      >
        {highlights.map((highlight) => (
          <TouchableOpacity
            key={highlight.id}
            style={styles.highlightItem}
            onPress={() => onHighlightPress?.(highlight.id)}
          >
            <Image
              source={{ uri: highlight.coverUrl }}
              style={styles.highlightCover}
            />
            <Text
              style={[styles.highlightTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {highlight.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  highlightsContainer: {
    paddingHorizontal: 12,
  },
  highlightItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 80,
  },
  highlightCover: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  highlightTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});
