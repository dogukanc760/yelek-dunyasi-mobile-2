import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {COLORS, FONTS} from '../../constants';
import * as ImagePicker from 'react-native-image-picker';
import clubService from '../../services/clubService';

export const CreateClubScreen = () => {
  const {colors} = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'private',
    website: '',
    email: '',
    address: '',
    isOfficial: true,
  });
  const [logoFile, setLogoFile] = useState<any>(null);
  const [coverFile, setCoverFile] = useState<any>(null);

  const handleImagePick = async (type: 'logo' | 'cover') => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1000,
      maxWidth: 1000,
    };

    try {
      const result = await ImagePicker.launchImageLibrary(options);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
        return;
      }

      if (result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        if (type === 'logo') {
          setLogoFile(selectedAsset);
        } else {
          setCoverFile(selectedAsset);
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    if (!logoFile || !coverFile) {
      Alert.alert('Hata', 'Lütfen logo ve kapak fotoğrafı seçin.');
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('isOfficial', formData.isOfficial ? '1' : '0');
      formDataToSend.append('logoFile', {
        uri: logoFile.uri,
        type: logoFile.type,
        name: logoFile.fileName,
      });
      formDataToSend.append('coverFile', {
        uri: coverFile.uri,
        type: coverFile.type,
        name: coverFile.fileName,
      });

      const response = await clubService.createClub(formDataToSend);

      if (response.isSuccess) {
        Alert.alert('Başarılı', 'Kulüp başarıyla oluşturuldu.');
        // Navigate back or to club detail
      } else {
        throw new Error(
          response.errors?.[0] || 'Kulüp oluşturulurken bir hata oluştu',
        );
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        error instanceof Error
          ? error.message
          : 'Kulüp oluşturulurken bir hata oluştu',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: colors.text}]}>
          Yeni Kulüp Oluştur
        </Text>

        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => handleImagePick('logo')}>
            {logoFile ? (
              <Image
                source={{uri: logoFile.uri}}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>Logo Yükle</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => handleImagePick('cover')}>
            {coverFile ? (
              <Image
                source={{uri: coverFile.uri}}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>Kapak Fotoğrafı Yükle</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Kulüp Adı *</Text>
          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            value={formData.name}
            onChangeText={text => setFormData(prev => ({...prev, name: text}))}
            placeholder="Kulüp adını girin"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Açıklama *</Text>
          <TextInput
            style={[
              styles.textArea,
              {color: colors.text, borderColor: colors.border},
            ]}
            value={formData.description}
            onChangeText={text =>
              setFormData(prev => ({...prev, description: text}))
            }
            placeholder="Kulüp açıklamasını girin"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Website</Text>
          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            value={formData.website}
            onChangeText={text =>
              setFormData(prev => ({...prev, website: text}))
            }
            placeholder="https://example.com"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="url"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>E-posta</Text>
          <TextInput
            style={[
              styles.input,
              {color: colors.text, borderColor: colors.border},
            ]}
            value={formData.email}
            onChangeText={text => setFormData(prev => ({...prev, email: text}))}
            placeholder="ornek@email.com"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, {color: colors.text}]}>Adres</Text>
          <TextInput
            style={[
              styles.textArea,
              {color: colors.text, borderColor: colors.border},
            ]}
            value={formData.address}
            onChangeText={text =>
              setFormData(prev => ({...prev, address: text}))
            }
            placeholder="Kulüp adresini girin"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Kulüp Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 24,
    textAlign: 'center',
  },
  imageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  imageUploadButton: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadText: {
    color: COLORS.primary,
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
  },
  textArea: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
});
