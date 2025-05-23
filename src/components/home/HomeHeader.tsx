import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const HomeHeader: React.FC = () => {
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.card}]}>
      <View style={styles.leftSection}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.centerSection}>
        <Text style={[styles.title, {color: colors.text}]}>
          Yelekli Dünyası
        </Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons
            name="message-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    backgroundColor: '#fff',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconButton: {
    marginLeft: 8,
  },
});
