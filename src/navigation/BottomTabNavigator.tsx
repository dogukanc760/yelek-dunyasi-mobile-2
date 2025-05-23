import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {CurvedBottomBar} from 'react-native-curved-bottom-bar';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeScreen} from '../screens/home/HomeScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {useTheme} from '@react-navigation/native';

const TAB_ICONS = {
  AnaSayfa: 'home',
  Sosyal: 'account-multiple',
  Pazar: 'store',
  Bildirimler: 'bell',
  Profil: 'account',
};

export const BottomTabNavigator = () => {
  const {colors} = useTheme();

  return (
    <CurvedBottomBar.Navigator
      style={styles.bottomBar}
      height={60}
      circleWidth={60}
      bgColor="#fff"
      initialRouteName="AnaSayfa"
      borderTopLeftRight
      renderCircle={({selectedTab, navigate}) => (
        <View style={styles.btnCircle}>
          <MaterialCommunityIcons
            name={TAB_ICONS[selectedTab] || 'circle'}
            size={32}
            color={colors.primary}
          />
        </View>
      )}
      tabBar={({routeName, selectedTab, navigate}) => (
        <TouchableTab
          key={routeName}
          label={routeName}
          icon={TAB_ICONS[routeName]}
          isFocused={selectedTab === routeName}
          onPress={() => navigate(routeName)}
          color={colors}
        />
      )}>
      <CurvedBottomBar.Screen
        name="AnaSayfa"
        position="LEFT"
        component={HomeScreen}
      />
      <CurvedBottomBar.Screen
        name="Sosyal"
        position="LEFT"
        component={MessagesScreen}
      />
      <CurvedBottomBar.Screen
        name="Pazar"
        position="CENTER"
        component={MessagesScreen}
      />
      <CurvedBottomBar.Screen
        name="Bildirimler"
        position="RIGHT"
        component={NotificationsScreen}
      />
      <CurvedBottomBar.Screen
        name="Profil"
        position="RIGHT"
        component={ProfileScreen}
      />
    </CurvedBottomBar.Navigator>
  );
};

const TouchableTab = ({label, icon, isFocused, onPress, color}) => (
  <TouchableOpacity
    style={styles.tabItem}
    onPress={onPress}
    activeOpacity={0.7}>
    <MaterialCommunityIcons
      name={icon}
      size={24}
      color={isFocused ? color.primary : color.text}
      style={{marginBottom: 2}}
    />
    <Text
      style={{
        color: isFocused ? color.primary : color.text,
        fontSize: 12,
        fontWeight: isFocused ? 'bold' : 'normal',
      }}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    top: -18,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
