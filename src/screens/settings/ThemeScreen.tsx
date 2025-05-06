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

const ThemeScreen = () => {
  const {colors} = useTheme();
  const [selectedTheme, setSelectedTheme] = useState('system'); // 'light', 'dark', 'system'
  const [themeColor, setThemeColor] = useState('blue'); // 'blue', 'green', 'orange', 'purple', 'red'

  const themeOptions = [
    {
      id: 'system',
      title: 'Sistem Teması',
      description: 'Cihazınızın tema ayarlarını kullanır',
      icon: 'theme-light-dark',
    },
    {
      id: 'light',
      title: 'Aydınlık Tema',
      description: 'Aydınlık tema modunu kullanır',
      icon: 'white-balance-sunny',
    },
    {
      id: 'dark',
      title: 'Karanlık Tema',
      description: 'Karanlık tema modunu kullanır',
      icon: 'moon-waning-crescent',
    },
  ];

  const colorOptions = [
    {id: 'blue', name: 'Mavi', color: '#007AFF'},
    {id: 'green', name: 'Yeşil', color: '#34C759'},
    {id: 'orange', name: 'Turuncu', color: '#FF9500'},
    {id: 'purple', name: 'Mor', color: '#AF52DE'},
    {id: 'red', name: 'Kırmızı', color: '#FF3B30'},
  ];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Görünüm Modu
        </Text>

        {themeOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.themeOption,
              selectedTheme === option.id && [
                styles.activeOption,
                {borderColor: colors.primary},
              ],
              {backgroundColor: colors.card},
            ]}
            onPress={() => setSelectedTheme(option.id)}>
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={selectedTheme === option.id ? colors.primary : colors.text}
            />
            <View style={styles.themeTextContainer}>
              <Text
                style={[
                  styles.themeTitle,
                  {
                    color:
                      selectedTheme === option.id
                        ? colors.primary
                        : colors.text,
                  },
                ]}>
                {option.title}
              </Text>
              <Text style={[styles.themeDescription, {color: colors.text}]}>
                {option.description}
              </Text>
            </View>
            {selectedTheme === option.id && (
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
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Tema Rengi
        </Text>
        <View style={styles.colorOptions}>
          {colorOptions.map(color => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorOption,
                themeColor === color.id && styles.activeColorOption,
                {
                  borderColor:
                    themeColor === color.id ? color.color : 'transparent',
                },
              ]}
              onPress={() => setThemeColor(color.id)}>
              <View
                style={[styles.colorCircle, {backgroundColor: color.color}]}
              />
              <Text style={[styles.colorName, {color: colors.text}]}>
                {color.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.previewContainer, {backgroundColor: colors.card}]}>
          <Text style={[styles.previewTitle, {color: colors.text}]}>
            Önizleme
          </Text>
          <View style={styles.previewContent}>
            <View
              style={[
                styles.previewHeader,
                {borderBottomColor: colors.border},
              ]}>
              <Text style={[styles.previewText, {color: colors.text}]}>
                Başlık
              </Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={[styles.previewText, {color: colors.text}]}>
                Bu, seçtiğiniz tema renginin nasıl görüneceğinin bir
                önizlemesidir.
              </Text>
              <TouchableOpacity
                style={[
                  styles.previewButton,
                  {
                    backgroundColor: colorOptions.find(c => c.id === themeColor)
                      ?.color,
                  },
                ]}>
                <Text style={styles.previewButtonText}>Buton</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.infoText, {color: colors.text}]}>
          Not: Tema değişiklikleri uygulamayı yeniden başlattığınızda tamamen
          uygulanacaktır.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          {backgroundColor: colorOptions.find(c => c.id === themeColor)?.color},
        ]}>
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
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  activeOption: {
    borderWidth: 1,
  },
  themeTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  activeColorOption: {
    borderWidth: 2,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  colorName: {
    fontSize: 14,
  },
  previewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
  },
  previewContent: {
    padding: 16,
  },
  previewHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  previewBody: {
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  previewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
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

export default ThemeScreen;
