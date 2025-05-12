import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './theme';
import {NotificationProvider} from './context/NotificationContext';
import {LanguageProvider} from './context/LanguageContext';
import {AuthProvider} from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import {OneSignal} from 'react-native-onesignal';
import {LogLevel} from 'react-native-onesignal';
import {getUniqueId} from 'react-native-device-info';

const App = () => {
  useEffect(() => {
    const initializeOneSignal = async () => {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      OneSignal.initialize('690b3097-9d03-4531-b728-bd9f66400ad4');

      const deviceId = await getUniqueId();
      OneSignal.User.addTag('deviceId', deviceId);

      OneSignal.Notifications.requestPermission(false);
    };

    initializeOneSignal();
  }, []);
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
