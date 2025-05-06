import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {UpdateProfileRequest} from '../../services/userService';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {
    user,
    updateProfile,
    updateProfilePicture,
    isLoading,
    refreshUserProfile,
  } = useAuth();

  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    nickname: user?.nickname || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    district: user?.district || '',
    motorcycleBrand: user?.motorcycleBrand || '',
    motorcycleModel: user?.motorcycleModel || '',
    motorcycleCc: user?.motorcycleCc || 0,
    bloodType: user?.bloodType || '',
    clothingSize: user?.clothingSize || '',
    driverLicenseType: user?.driverLicenseType || '',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactRelation: user?.emergencyContactRelation || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kullanıcı verilerini yenileme
    refreshUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    field: keyof UpdateProfileRequest,
    value: string | number,
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Resim seçilirken hata:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  const handleUploadImage = async (imageUri: string) => {
    try {
      setIsSubmitting(true);
      await updateProfilePicture(imageUri);
      Alert.alert('Başarılı', 'Profil resminiz başarıyla güncellendi.');
    } catch (error) {
      console.error('Profil resmi yüklenirken hata:', error);
      Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phone === '' || phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleSave = async () => {
    try {
      // Telefon numarası kontrolü
      if (!validatePhoneNumber(profileData.phoneNumber || '')) {
        Alert.alert(
          'Hata',
          'Geçerli bir telefon numarası giriniz. (10-11 rakam)',
        );
        return;
      }

      // Acil durum telefon numarası kontrolü
      if (!validatePhoneNumber(profileData.emergencyContactPhone || '')) {
        Alert.alert(
          'Hata',
          'Geçerli bir acil durum telefon numarası giriniz. (10-11 rakam)',
        );
        return;
      }

      setIsSubmitting(true);
      await updateProfile(profileData);
      Alert.alert('Başarılı', 'Profil bilgileriniz başarıyla güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {backgroundColor: colors.background},
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          Lütfen bekleyin...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, {backgroundColor: colors.card}]}>
          {user?.profilePicture ? (
            <Image
              source={{uri: user.profilePicture}}
              style={styles.profileImage}
            />
          ) : (
            <MaterialCommunityIcons
              name="account"
              size={80}
              color={colors.primary}
            />
          )}
          <TouchableOpacity
            style={[
              styles.changePhotoButton,
              {backgroundColor: colors.primary},
            ]}
            onPress={handleSelectImage}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Kişisel Bilgiler
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Ad</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.firstName}
          onChangeText={value => handleChange('firstName', value)}
          placeholder="Ad"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Soyad</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.lastName}
          onChangeText={value => handleChange('lastName', value)}
          placeholder="Soyad"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Kullanıcı Adı</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.nickname}
          onChangeText={value => handleChange('nickname', value)}
          placeholder="Kullanıcı Adı"
          placeholderTextColor={colors.text}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, {color: colors.text}]}>Telefon</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.phoneNumber}
          onChangeText={value => handleChange('phoneNumber', value)}
          placeholder="Telefon"
          placeholderTextColor={colors.text}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Adres Bilgileri
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Şehir</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.city}
          onChangeText={value => handleChange('city', value)}
          placeholder="Şehir"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>İlçe</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.district}
          onChangeText={value => handleChange('district', value)}
          placeholder="İlçe"
          placeholderTextColor={colors.text}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Motosiklet Bilgileri
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Marka</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.motorcycleBrand}
          onChangeText={value => handleChange('motorcycleBrand', value)}
          placeholder="Motosiklet Markası"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Model</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.motorcycleModel}
          onChangeText={value => handleChange('motorcycleModel', value)}
          placeholder="Motosiklet Modeli"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>
          Motor Hacmi (cc)
        </Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={
            profileData.motorcycleCc ? profileData.motorcycleCc.toString() : ''
          }
          onChangeText={value =>
            handleChange('motorcycleCc', parseInt(value) || 0)
          }
          placeholder="Motor Hacmi (cc)"
          placeholderTextColor={colors.text}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Kişisel Detaylar
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Kan Grubu</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.bloodType}
          onChangeText={value => handleChange('bloodType', value)}
          placeholder="Kan Grubu"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Kıyafet Bedeni</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.clothingSize}
          onChangeText={value => handleChange('clothingSize', value)}
          placeholder="Kıyafet Bedeni"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Ehliyet Tipi</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.driverLicenseType}
          onChangeText={value => handleChange('driverLicenseType', value)}
          placeholder="Ehliyet Tipi"
          placeholderTextColor={colors.text}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Acil Durum İletişim
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Kişi Adı</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.emergencyContactName}
          onChangeText={value => handleChange('emergencyContactName', value)}
          placeholder="Acil Durum Kişi Adı"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Yakınlık</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.emergencyContactRelation}
          onChangeText={value =>
            handleChange('emergencyContactRelation', value)
          }
          placeholder="Yakınlık (örn: Eş, Anne, Baba)"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, {color: colors.text}]}>Telefon</Text>
        <TextInput
          style={[
            styles.input,
            {backgroundColor: colors.card, color: colors.text},
          ]}
          value={profileData.emergencyContactPhone}
          onChangeText={value => handleChange('emergencyContactPhone', value)}
          placeholder="Acil Durum Telefon"
          placeholderTextColor={colors.text}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, {backgroundColor: colors.primary}]}
        onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EditProfileScreen;
