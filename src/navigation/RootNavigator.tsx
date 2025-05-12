import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import {BottomTabNavigator} from './BottomTabNavigator';
import {useAuth} from '../context/AuthContext';
import {AnnouncementDetailScreen} from '../screens/announcements/AnnouncementDetailScreen';
import {ClubDetailScreen} from '../screens/clubs/ClubDetailScreen';
import EventsScreen from '../screens/events/EventsScreen';
import {MyEventsScreen} from '../screens/events/MyEventsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import {ClubsListScreen} from '../screens/clubs/ClubsListScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import TeamsScreen from '../screens/teams/TeamsScreen';
import TeamDetailScreen from '../screens/teams/TeamDetailScreen';
import {RootStackParamList} from '../types/navigation';
import {ClubMembersScreen} from '../screens/clubs/ClubMembersScreen';
import {ClubAnnouncementsScreen} from '../screens/clubs/ClubAnnouncementsScreen';
import RoutesScreen from '../screens/routes/RoutesScreen';
import RouteDetailScreen from '../screens/routes/RouteDetailScreen';
import ManageClubScreen from '../screens/clubs/ManageClub';
import {ClubApplicationsScreen} from '../screens/clubs/ClubApplications';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import CreateClubAnnouncementScreen from '../screens/clubs/CreateClubAnnouncementScreen';
import EditClubScreen from '../screens/clubs/EditClubScreen';
import {COLORS} from '../constants';
import {useNavigation} from '@react-navigation/native';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import ClubEventsScreen from '../screens/clubs/ClubEventsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const createDefaultScreenOptions = (navigation: any) => ({
  headerShown: true,
  headerTitle: '',
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{marginLeft: 10}}>
      <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
    </TouchableOpacity>
  ),
});

const RootNavigator = () => {
  const {isAuthenticated} = useAuth();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={() => createDefaultScreenOptions(navigation)}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={BottomTabNavigator}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AnnouncementDetail"
            component={AnnouncementDetailScreen}
          />
          <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="MyEvents" component={MyEventsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ClubsList" component={ClubsListScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Teams" component={TeamsScreen} />
          <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
          <Stack.Screen name="ClubMembers" component={ClubMembersScreen} />
          <Stack.Screen
            name="ClubAnnouncements"
            component={ClubAnnouncementsScreen}
          />
          <Stack.Screen name="ClubEvents" component={ClubEventsScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} />
          <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
          <Stack.Screen name="ManageClub" component={ManageClubScreen} />
          <Stack.Screen
            name="ClubApplications"
            component={ClubApplicationsScreen}
          />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen
            name="CreateClubAnnouncementScreen"
            component={CreateClubAnnouncementScreen}
          />
          <Stack.Screen name="EditClub" component={EditClubScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
