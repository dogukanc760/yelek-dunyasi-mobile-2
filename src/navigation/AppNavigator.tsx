import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginScreen} from '../components';
import {useAuth} from '../context/AuthContext';
import {ClubMembersScreen} from '../screens/clubs/ClubMembersScreen';
import {ClubAnnouncementsScreen} from '../screens/clubs/ClubAnnouncementsScreen';
import {ClubEventsScreen} from '../screens/clubs/ClubEventsScreen';
import {ClubDetailScreen} from '../screens/clubs/ClubDetailScreen';
import {EventDetailScreen} from '../screens/events/EventDetailScreen';
import {ClubApplicationsScreen} from '../screens/clubs/ClubApplications';
import ManageClub from '../screens/clubs/ManageClub';
import {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Geçici ekran
const TempScreen = () => <LoginScreen />;

const AppNavigator = () => {
  const {isAuthenticated, user} = useAuth();
  const isProfileCompleted = user?.isProfileCompleted || false;

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={TempScreen} />
        <Stack.Screen name="ForgotPassword" component={TempScreen} />
      </Stack.Navigator>
    );
  }

  if (!isProfileCompleted) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="ProfileCompletion" component={TempScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <Stack.Screen
        name="Home"
        component={TempScreen}
        options={{headerTitle: 'Ana Sayfa'}}
      />
      <Stack.Screen
        name="ClubApplications"
        component={ClubApplicationsScreen}
        options={{
          headerTitle: 'Gelen Başvurular',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ManageClub"
        component={ManageClub}
        options={{
          headerTitle: 'Kulüp Yönetimi',
        }}
      />
      <Stack.Screen
        name="ClubMembers"
        component={ClubMembersScreen}
        options={{
          headerTitle: 'Kulüp Üyeleri',
        }}
      />
      <Stack.Screen
        name="ClubEvents"
        component={ClubEventsScreen}
        options={{
          headerTitle: 'Kulüp Etkinlikleri',
        }}
      />
      <Stack.Screen
        name="ClubDetail"
        component={ClubDetailScreen}
        options={{
          headerTitle: 'Kulüp Detayı',
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerTitle: 'Etkinlik Detayı',
        }}
      />
      <Stack.Screen
        name="ClubAnnouncements"
        component={ClubAnnouncementsScreen}
        options={{
          headerTitle: 'Kulüp Duyuruları',
        }}
      />
      <Stack.Screen
        name="EditClub"
        component={TempScreen}
        options={{
          headerTitle: 'Kulübü Düzenle',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
