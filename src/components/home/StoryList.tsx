import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';

export const StoryList: React.FC = () => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      <View style={styles.content} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
  },
});
