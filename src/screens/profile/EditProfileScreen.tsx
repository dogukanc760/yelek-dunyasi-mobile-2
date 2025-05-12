import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {UpdateProfileRequest, ImageUpload} from '../../services/userService';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import DeviceInfo from 'react-native-device-info';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

// Sabit seçenek listeleri
const BLOOD_TYPES = [
  'UNKNOWN',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  '0+',
  '0-',
];
const CLOTHING_SIZES = ['UNKNOWN', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const DRIVER_LICENSE_TYPES = [
  'UNKNOWN',
  'M',
  'A1',
  'A2',
  'A',
  'B1',
  'B',
  'BE',
  'C1',
  'C1E',
  'C',
  'CE',
  'D1',
  'D1E',
  'D',
  'DE',
  'F',
  'G',
];

// Yeni sabit seçenek listeleri
const GENDER_OPTIONS = ['Belirtilmemiş', 'Erkek', 'Kadın', 'Diğer'];
const PROFESSION_OPTIONS = [
  'Belirtilmemiş',
  'Öğrenci',
  'Mühendis',
  'Doktor',
  'Avukat',
  'Serbest Meslek',
  'Diğer',
];

const EditProfileScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {user, updateProfile, isLoading, refreshUserProfile} = useAuth();

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
    bloodType: user?.bloodType || 'UNKNOWN',
    clothingSize: user?.clothingSize || 'UNKNOWN',
    driverLicenseType: user?.driverLicenseType || 'UNKNOWN',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactRelation: user?.emergencyContactRelation || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate || '',
    profession: user?.profession || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayOneSignalId, setDisplayOneSignalId] = useState<string>('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const [bloodTypeModalVisible, setBloodTypeModalVisible] = useState(false);
  const [clothingSizeModalVisible, setClothingSizeModalVisible] =
    useState(false);
  const [driverLicenseModalVisible, setDriverLicenseModalVisible] =
    useState(false);
  // Yeni modal state'leri
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [professionModalVisible, setProfessionModalVisible] = useState(false);
  // Yeni state: Tarih seçici görünürlüğü
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Kullanıcı verilerini yenileme
    if (user) {
      refreshUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initializeOneSignalId = async () => {
      // @ts-ignore Property 'oneSignalPlayerId' does not exist on type 'UserProfileResponse'.
      if (user?.oneSignalPlayerId && user.oneSignalPlayerId.trim() !== '') {
        // @ts-ignore Property 'oneSignalPlayerId' does not exist on type 'UserProfileResponse'.
        setDisplayOneSignalId(user.oneSignalPlayerId);
      } else {
        try {
          const deviceId = await DeviceInfo.getUniqueId();
          setDisplayOneSignalId(deviceId);
        } catch (error) {
          console.error("Cihaz ID'si alınırken hata:", error);
          setDisplayOneSignalId('ID Alınamadı');
        }
      }
    };

    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        // @ts-ignore Property 'phone' does not exist on type 'UserProfileResponse'.
        phoneNumber: user.phoneNumber || user.phone || '',
        city: user.city || '',
        district: user.district || '',
        motorcycleBrand: user.motorcycleBrand || '',
        motorcycleModel: user.motorcycleModel || '',
        motorcycleCc: user.motorcycleCc || 0,
        bloodType: user.bloodType || 'UNKNOWN',
        clothingSize: user.clothingSize || 'UNKNOWN',
        driverLicenseType: user.driverLicenseType || 'UNKNOWN',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactRelation: user.emergencyContactRelation || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        gender: user.gender || '',
        birthDate: user.birthDate || '',
        profession: user.profession || '',
      });
      initializeOneSignalId();
    }
  }, [user]);

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
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Resim seçilirken hata:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
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
      const dataToUpdate: UpdateProfileRequest = {
        ...profileData,
        oneSignalPlayerId: displayOneSignalId,
        motorcycleCc: Number(profileData.motorcycleCc) || 0,
      };

      let photoToUpload: ImageUpload | undefined = undefined;
      if (selectedImageUri) {
        const uriParts = selectedImageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        photoToUpload = {
          uri: selectedImageUri,
          type: `image/${fileType}`,
          name: `profile.${fileType}`,
        };
      }

      await updateProfile(dataToUpdate, photoToUpload);
      Alert.alert('Başarılı', 'Profil bilgileriniz başarıyla güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Profil kaydetme hatası:', error);
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tarih seçici için onChange handler
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate =
      selectedDate ||
      (profileData.birthDate ? new Date(profileData.birthDate) : new Date());
    setShowDatePicker(Platform.OS === 'ios'); // iOS'ta seçici sürekli açık kalabilir, Android'de event sonrası kapanır genelde.
    // Şimdilik iOS için de event sonrası kapatalım.
    setShowDatePicker(false);

    if (event.type === 'set' && selectedDate) {
      // Tarihi YYYY-MM-DD formatına çevir
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      handleChange('birthDate', formattedDate);
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
              source={{
                uri:
                  'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                  user.profilePicture,
              }}
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
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setBloodTypeModalVisible(true)}>
          <Text style={{color: colors.text}}>
            {profileData.bloodType || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, {color: colors.text}]}>Kıyafet Bedeni</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setClothingSizeModalVisible(true)}>
          <Text style={{color: colors.text}}>
            {profileData.clothingSize || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, {color: colors.text}]}>Ehliyet Tipi</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setDriverLicenseModalVisible(true)}>
          <Text style={{color: colors.text}}>
            {profileData.driverLicenseType || 'Seçiniz'}
          </Text>
        </TouchableOpacity>
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

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Sistem Bilgileri
        </Text>
        <Text style={[styles.label, {color: colors.text}]}>
          OneSignal Player ID (Cihaz ID)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              opacity: 0.7,
            },
          ]}
          value={displayOneSignalId}
          editable={false}
          placeholder="OneSignal ID"
          placeholderTextColor={colors.text}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Ek Bilgiler (Yeni)
        </Text>

        <Text style={[styles.label, {color: colors.text}]}>Cinsiyet</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setGenderModalVisible(true)}>
          <Text style={{color: colors.text}}>
            {profileData.gender || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, {color: colors.text}]}>Doğum Tarihi</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setShowDatePicker(true)}>
          <Text style={{color: colors.text}}>
            {profileData.birthDate
              ? new Date(profileData.birthDate).toLocaleDateString('tr-TR')
              : 'Tarih Seçiniz'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, {color: colors.text}]}>Meslek</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.pickerInput,
            {backgroundColor: colors.card},
          ]}
          onPress={() => setProfessionModalVisible(true)}>
          <Text style={{color: colors.text}}>
            {profileData.profession || 'Seçiniz'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, {backgroundColor: colors.primary}]}
        onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>

      {/* Kan Grubu Modal */}
      <Modal
        transparent={true}
        visible={bloodTypeModalVisible}
        onRequestClose={() => setBloodTypeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Kan Grubu Seç
            </Text>
            <ScrollView>
              {BLOOD_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange('bloodType', type);
                    setBloodTypeModalVisible(false);
                  }}>
                  <Text style={{color: colors.text}}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setBloodTypeModalVisible(false)}>
              <Text style={{color: colors.primary}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kıyafet Bedeni Modal */}
      <Modal
        transparent={true}
        visible={clothingSizeModalVisible}
        onRequestClose={() => setClothingSizeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Kıyafet Bedeni Seç
            </Text>
            <ScrollView>
              {CLOTHING_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange('clothingSize', size);
                    setClothingSizeModalVisible(false);
                  }}>
                  <Text style={{color: colors.text}}>{size}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setClothingSizeModalVisible(false)}>
              <Text style={{color: colors.primary}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ehliyet Tipi Modal */}
      <Modal
        transparent={true}
        visible={driverLicenseModalVisible}
        onRequestClose={() => setDriverLicenseModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Ehliyet Tipi Seç
            </Text>
            <ScrollView>
              {DRIVER_LICENSE_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange('driverLicenseType', type);
                    setDriverLicenseModalVisible(false);
                  }}>
                  <Text style={{color: colors.text}}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDriverLicenseModalVisible(false)}>
              <Text style={{color: colors.primary}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cinsiyet Modal */}
      <Modal
        transparent={true}
        visible={genderModalVisible}
        onRequestClose={() => setGenderModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Cinsiyet Seç
            </Text>
            <ScrollView>
              {GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange(
                      'gender',
                      option === 'Belirtilmemiş' ? '' : option,
                    );
                    setGenderModalVisible(false);
                  }}>
                  <Text style={{color: colors.text}}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setGenderModalVisible(false)}>
              <Text style={{color: colors.primary}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Meslek Modal */}
      <Modal
        transparent={true}
        visible={professionModalVisible}
        onRequestClose={() => setProfessionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Meslek Seç
            </Text>
            <ScrollView>
              {PROFESSION_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    handleChange(
                      'profession',
                      option === 'Belirtilmemiş' ? '' : option,
                    );
                    setProfessionModalVisible(false);
                  }}>
                  <Text style={{color: colors.text}}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProfessionModalVisible(false)}>
              <Text style={{color: colors.primary}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tarih Seçici (Modal gibi davranır) */}
      {showDatePicker && (
        <DateTimePicker
          value={
            profileData.birthDate ? new Date(profileData.birthDate) : new Date()
          }
          mode={'date'}
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
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
    marginBottom: 5,
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
  pickerInput: {
    justifyContent: 'center',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    color: 'white',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
});

export default EditProfileScreen;
