import React, {useState} from 'react';
import {View, Text, StyleSheet, Switch, ScrollView} from 'react-native';
import {useTheme} from '@react-navigation/native';

const NotificationsScreen = () => {
  const {colors} = useTheme();
  const [allNotifications, setAllNotifications] = useState(true);
  const [eventInvitations, setEventInvitations] = useState(true);
  const [clubInvitations, setClubInvitations] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [rideAlerts, setRideAlerts] = useState(true);
  const [comments, setComments] = useState(true);
  const [messages, setMessages] = useState(true);

  const toggleAllNotifications = (value: boolean) => {
    setAllNotifications(value);
    if (!value) {
      // Tüm bildirimleri kapat
      setEventInvitations(false);
      setClubInvitations(false);
      setEventReminders(false);
      setRideAlerts(false);
      setComments(false);
      setMessages(false);
    } else {
      // Tüm bildirimleri aç
      setEventInvitations(true);
      setClubInvitations(true);
      setEventReminders(true);
      setRideAlerts(true);
      setComments(true);
      setMessages(true);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Genel Bildirim Ayarları
        </Text>
        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Tüm Bildirimleri Aç/Kapat
          </Text>
          <Switch
            value={allNotifications}
            onValueChange={toggleAllNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={allNotifications ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Bildirim Türleri
        </Text>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Etkinlik Davetleri
          </Text>
          <Switch
            value={eventInvitations}
            onValueChange={setEventInvitations}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={eventInvitations ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Kulüp Davetleri
          </Text>
          <Switch
            value={clubInvitations}
            onValueChange={setClubInvitations}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={clubInvitations ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Etkinlik Hatırlatmaları
          </Text>
          <Switch
            value={eventReminders}
            onValueChange={setEventReminders}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={eventReminders ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Sürüş Uyarıları
          </Text>
          <Switch
            value={rideAlerts}
            onValueChange={setRideAlerts}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={rideAlerts ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Yorumlar ve Beğeniler
          </Text>
          <Switch
            value={comments}
            onValueChange={setComments}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={comments ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <Text style={[styles.settingText, {color: colors.text}]}>
            Mesajlar
          </Text>
          <Switch
            value={messages}
            onValueChange={setMessages}
            disabled={!allNotifications}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={messages ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.infoText, {color: colors.text}]}>
          Not: Bildirim ayarlarını değiştirdiğinizde, değişiklikler otomatik
          olarak kaydedilir.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default NotificationsScreen;
