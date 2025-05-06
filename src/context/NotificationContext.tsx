import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationSettingsType = {
  allNotifications: boolean;
  messageNotifications: boolean;
};

type NotificationContextType = {
  settings: NotificationSettingsType;
  toggleAllNotifications: () => Promise<void>;
  toggleMessageNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    allNotifications: true,
    messageNotifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Bildirim ayarları yüklenirken hata:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettingsType) => {
    try {
      await AsyncStorage.setItem(
        'notificationSettings',
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      console.error('Bildirim ayarları kaydedilirken hata:', error);
    }
  };

  const toggleAllNotifications = async () => {
    const newSettings = {
      ...settings,
      allNotifications: !settings.allNotifications,
      messageNotifications: !settings.allNotifications
        ? false
        : settings.messageNotifications,
    };
    await saveSettings(newSettings);
  };

  const toggleMessageNotifications = async () => {
    if (!settings.allNotifications) return;
    const newSettings = {
      ...settings,
      messageNotifications: !settings.messageNotifications,
    };
    await saveSettings(newSettings);
  };

  return (
    <NotificationContext.Provider
      value={{settings, toggleAllNotifications, toggleMessageNotifications}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
};
