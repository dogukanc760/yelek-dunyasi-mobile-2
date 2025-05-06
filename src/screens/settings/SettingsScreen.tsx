import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuth} from '../../context/AuthContext';

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const {colors} = useTheme();
  const {logout} = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <TouchableOpacity
        style={[styles.settingItem, {borderBottomColor: colors.border}]}
        onPress={() => navigation.navigate('Notifications')}>
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={colors.text}
        />
        <Text style={[styles.settingText, {color: colors.text}]}>
          Bildirimler
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, {borderBottomColor: colors.border}]}
        onPress={() => navigation.navigate('Privacy')}>
        <MaterialCommunityIcons
          name="shield-outline"
          size={24}
          color={colors.text}
        />
        <Text style={[styles.settingText, {color: colors.text}]}>Gizlilik</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, {borderBottomColor: colors.border}]}
        onPress={() => navigation.navigate('Theme')}>
        <MaterialCommunityIcons
          name="theme-light-dark"
          size={24}
          color={colors.text}
        />
        <Text style={[styles.settingText, {color: colors.text}]}>Tema</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, {borderBottomColor: colors.border}]}
        onPress={() => navigation.navigate('Language')}>
        <MaterialCommunityIcons
          name="translate"
          size={24}
          color={colors.text}
        />
        <Text style={[styles.settingText, {color: colors.text}]}>Dil</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, {borderBottomColor: colors.border}]}
        onPress={logout}>
        <MaterialCommunityIcons name="logout" size={24} color="red" />
        <Text style={[styles.settingText, {color: 'red'}]}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
});

export default SettingsScreen;
