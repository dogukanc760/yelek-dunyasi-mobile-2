import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../theme';
import {useNotifications} from '../context/NotificationContext';
import {useLanguage} from '../context/LanguageContext';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

const SettingsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {isDarkMode, toggleTheme} = useTheme();
  const {settings, toggleAllNotifications, toggleMessageNotifications} =
    useNotifications();
  const {language, setLanguage, getLanguageName} = useLanguage();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const languages: {code: 'tr' | 'en'; name: string}[] = [
    {code: 'tr', name: 'Türkçe'},
    {code: 'en', name: 'English'},
  ];

  const SettingItem = ({
    icon,
    title,
    value,
    onPress,
    hasSwitch,
    switchValue,
    onToggle,
    disabled = false,
  }: {
    icon: string;
    title: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onToggle?: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={!onPress || disabled}>
      <View style={styles.settingItemLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={disabled ? '#999' : '#666'}
        />
        <Text
          style={[
            styles.settingItemTitle,
            disabled && styles.settingItemTitleDisabled,
          ]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingItemRight}>
        {value && (
          <Text
            style={[
              styles.settingItemValue,
              disabled && styles.settingItemValueDisabled,
            ]}>
            {value}
          </Text>
        )}
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onToggle}
            disabled={disabled}
          />
        )}
        {onPress && !disabled && (
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  const LanguageModal = () => (
    <Modal
      visible={isLanguageModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsLanguageModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dil Seçimi</Text>
          <FlatList
            data={languages}
            keyExtractor={item => item.code}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={async () => {
                  await setLanguage(item.code);
                  setIsLanguageModalVisible(false);
                }}>
                <Text style={styles.languageText}>{item.name}</Text>
                {language === item.code && (
                  <MaterialCommunityIcons name="check" size={24} color="#666" />
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsLanguageModalVisible(false)}>
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <SettingItem
          icon="theme-light-dark"
          title="Karanlık Mod"
          hasSwitch
          switchValue={isDarkMode}
          onToggle={toggleTheme}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <SettingItem
          icon="bell-outline"
          title="Tüm Bildirimler"
          hasSwitch
          switchValue={settings.allNotifications}
          onToggle={toggleAllNotifications}
        />
        <SettingItem
          icon="message-text-outline"
          title="Mesaj Bildirimleri"
          hasSwitch
          switchValue={settings.messageNotifications}
          onToggle={toggleMessageNotifications}
          disabled={!settings.allNotifications}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dil ve Bölge</Text>
        <SettingItem
          icon="translate"
          title="Uygulama Dili"
          value={getLanguageName(language)}
          onPress={() => setIsLanguageModalVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap</Text>
        <SettingItem
          icon="account-outline"
          title="Profil Bilgileri"
          onPress={() => navigation.navigate('Profile')}
        />
        <SettingItem
          icon="lock-outline"
          title="Güvenlik"
          onPress={() => navigation.navigate('Security')}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Yardım ve Destek"
          onPress={() => navigation.navigate('Help')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        <SettingItem
          icon="information-outline"
          title="Uygulama Versiyonu"
          value="1.0.0"
        />
      </View>

      <LanguageModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  settingItemDisabled: {
    opacity: 0.7,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTitle: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  settingItemTitleDisabled: {
    color: '#999',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  settingItemValueDisabled: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;
