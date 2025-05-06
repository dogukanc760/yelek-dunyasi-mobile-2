import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {FONTS} from '../constants';

const EmptyFeed: React.FC = () => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, {color: colors.text}]}>
        Henüz içerik bulunmamaktadır.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    ...FONTS.body1,
    textAlign: 'center',
  },
});

export default EmptyFeed;
