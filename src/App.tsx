import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './theme';
import {NotificationProvider} from './context/NotificationContext';
import {LanguageProvider} from './context/LanguageContext';
import {AuthProvider} from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';

const App = () => {
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
