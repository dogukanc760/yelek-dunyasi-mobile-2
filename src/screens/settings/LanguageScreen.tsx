import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LanguageScreen = () => {
  const {colors} = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const languages = [
    {
      id: 'tr',
      name: 'Türkçe',
      nativeName: 'Türkçe',
      flag: '🇹🇷',
    },
    {
      id: 'en',
      name: 'İngilizce',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      id: 'de',
      name: 'Almanca',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
    },
    {
      id: 'fr',
      name: 'Fransızca',
      nativeName: 'Français',
      flag: '🇫🇷',
    },
    {
      id: 'es',
      name: 'İspanyolca',
      nativeName: 'Español',
      flag: '🇪🇸',
    },
    {
      id: 'it',
      name: 'İtalyanca',
      nativeName: 'Italiano',
      flag: '🇮🇹',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Uygulama Dili
        </Text>
        <Text style={[styles.sectionDescription, {color: colors.text}]}>
          Uygulama için tercih ettiğiniz dili seçin:
        </Text>

        {languages.map(language => (
          <TouchableOpacity
            key={language.id}
            style={[
              styles.languageOption,
              selectedLanguage === language.id && [
                styles.activeOption,
                {borderColor: colors.primary},
              ],
              {backgroundColor: colors.card},
            ]}
            onPress={() => setSelectedLanguage(language.id)}>
            <Text style={styles.flagEmoji}>{language.flag}</Text>
            <View style={styles.languageTextContainer}>
              <Text
                style={[
                  styles.languageName,
                  {
                    color:
                      selectedLanguage === language.id
                        ? colors.primary
                        : colors.text,
                  },
                ]}>
                {language.name}
              </Text>
              <Text style={[styles.languageNativeName, {color: colors.text}]}>
                {language.nativeName}
              </Text>
            </View>
            {selectedLanguage === language.id && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.infoTitle, {color: colors.text}]}>
          Dil Hakkında Bilgi
        </Text>
        <Text style={[styles.infoText, {color: colors.text}]}>
          Uygulama dilini değiştirdiğinizde, tüm metinler ve bildirimler
          seçtiğiniz dilde görüntülenecektir. Bazı kullanıcı tarafından
          oluşturulan içerikler orijinal dillerinde kalabilir.
        </Text>
        <Text style={[styles.infoText, {color: colors.text, marginTop: 8}]}>
          Not: Dil değişiklikleri uygulamayı yeniden başlattığınızda tamamen
          uygulanacaktır.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, {backgroundColor: colors.primary}]}>
        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  activeOption: {
    borderWidth: 1,
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
