import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';

type NotificationSettingsProps = {
  initialSettings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    notifyForNewEvents: boolean;
    notifyForEventUpdates: boolean;
    notifyForNewMessages: boolean;
    notifyForClubInvitations: boolean;
    notifyForNewProducts: boolean;
    notifyForOrderUpdates: boolean;
  };
  onSave: (settings: NotificationSettingsProps['initialSettings']) => void;
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialSettings,
  onSave,
}) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState(initialSettings);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    // Eğer ana bildirim ayarı kapatılırsa, tüm alt bildirimleri de kapat
    if (key === 'pushNotifications' && !newSettings.pushNotifications) {
      newSettings.notifyForNewEvents = false;
      newSettings.notifyForEventUpdates = false;
      newSettings.notifyForNewMessages = false;
      newSettings.notifyForClubInvitations = false;
      newSettings.notifyForNewProducts = false;
      newSettings.notifyForOrderUpdates = false;
    }

    setSettings(newSettings);
    onSave(newSettings);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Bildirim Kanalları
        </Text>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Push Bildirimleri
          </Text>
          <Switch
            value={settings.pushNotifications}
            onValueChange={() => handleToggle('pushNotifications')}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            E-posta Bildirimleri
          </Text>
          <Switch
            value={settings.emailNotifications}
            onValueChange={() => handleToggle('emailNotifications')}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            SMS Bildirimleri
          </Text>
          <Switch
            value={settings.smsNotifications}
            onValueChange={() => handleToggle('smsNotifications')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Bildirim Türleri
        </Text>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Yeni Etkinlikler
          </Text>
          <Switch
            value={settings.notifyForNewEvents}
            onValueChange={() => handleToggle('notifyForNewEvents')}
            disabled={!settings.pushNotifications}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Etkinlik Güncellemeleri
          </Text>
          <Switch
            value={settings.notifyForEventUpdates}
            onValueChange={() => handleToggle('notifyForEventUpdates')}
            disabled={!settings.pushNotifications}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Yeni Mesajlar
          </Text>
          <Switch
            value={settings.notifyForNewMessages}
            onValueChange={() => handleToggle('notifyForNewMessages')}
            disabled={!settings.pushNotifications}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Kulüp Davetleri
          </Text>
          <Switch
            value={settings.notifyForClubInvitations}
            onValueChange={() => handleToggle('notifyForClubInvitations')}
            disabled={!settings.pushNotifications}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Yeni Ürünler
          </Text>
          <Switch
            value={settings.notifyForNewProducts}
            onValueChange={() => handleToggle('notifyForNewProducts')}
            disabled={!settings.pushNotifications}
          />
        </View>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Sipariş Güncellemeleri
          </Text>
          <Switch
            value={settings.notifyForOrderUpdates}
            onValueChange={() => handleToggle('notifyForOrderUpdates')}
            disabled={!settings.pushNotifications}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    fontSize: 16,
  },
});
