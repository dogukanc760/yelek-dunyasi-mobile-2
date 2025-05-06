import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextStyle,
  TextInput,
} from 'react-native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {Button} from '../../components/ui';
import {COLORS, FONTS, SIZES, ROUTES} from '../../constants';
import {useAuthStore} from '../../store';

type FormData = {
  nickname: string;
  phoneNumber: string;
  city: string;
  district: string;
  motorcycleBrand: string;
  motorcycleModel: string;
  motorcycleCc: number | undefined;
  bloodType: string;
  clothingSize: string;
  driverLicenseType: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
};

const ProfileCompletionScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user, updateProfile} = useAuthStore();
  const {colors} = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nickname: user?.nickname || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    district: user?.district || '',
    motorcycleBrand: user?.motorcycleBrand || '',
    motorcycleModel: user?.motorcycleModel || '',
    motorcycleCc: user?.motorcycleCc || undefined,
    bloodType: user?.bloodType || '',
    clothingSize: user?.clothingSize || '',
    driverLicenseType: user?.driverLicenseType || '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Zorunlu alanları kontrol et
      const requiredFields = [
        'phoneNumber',
        'city',
        'district',
        'motorcycleBrand',
        'motorcycleModel',
      ];

      const missingFields = requiredFields.filter(
        field => !formData[field as keyof typeof formData],
      );

      if (missingFields.length > 0) {
        Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
        setIsLoading(false);
        return;
      }

      await updateProfile(formData);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => {
            // Ana sayfaya yönlendir
            navigation.reset({
              index: 0,
              routes: [{name: ROUTES.MAIN.HOME as never}],
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Hata',
        'Profil bilgileriniz güncellenirken bir hata oluştu.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, {color: colors.text}]}>
            Profil Bilgilerini Tamamla
          </Text>
          <Text style={styles.subtitle as TextStyle}>
            Motosiklet tutkunları topluluğuna katılmak için lütfen profil
            bilgilerinizi doldurun.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>
              Telefon Numarası
            </Text>
            <TextInput
              style={[styles.input, {borderColor: colors.border}]}
              value={formData.phoneNumber}
              onChangeText={(text: string) =>
                setFormData(prev => ({...prev, phoneNumber: text}))
              }
              placeholder="Telefon numaranızı girin"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Şehir</Text>
            <TextInput
              style={[styles.input, {borderColor: colors.border}]}
              value={formData.city}
              onChangeText={(text: string) =>
                setFormData(prev => ({...prev, city: text}))
              }
              placeholder="Şehrinizi girin"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>İlçe</Text>
            <TextInput
              style={[styles.input, {borderColor: colors.border}]}
              value={formData.district}
              onChangeText={(text: string) =>
                setFormData(prev => ({...prev, district: text}))
              }
              placeholder="İlçenizi girin"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>
              Motosiklet Markası
            </Text>
            <TextInput
              style={[styles.input, {borderColor: colors.border}]}
              value={formData.motorcycleBrand}
              onChangeText={(text: string) =>
                setFormData(prev => ({...prev, motorcycleBrand: text}))
              }
              placeholder="Motosiklet markanızı girin"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>
              Motosiklet Modeli
            </Text>
            <TextInput
              style={[styles.input, {borderColor: colors.border}]}
              value={formData.motorcycleModel}
              onChangeText={(text: string) =>
                setFormData(prev => ({...prev, motorcycleModel: text}))
              }
              placeholder="Motosiklet modelinizi girin"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Profili Tamamla"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  headerContainer: {
    marginBottom: SIZES.spacing.xl * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  formContainer: {
    marginBottom: SIZES.spacing.xl * 2,
  },
  buttonContainer: {
    marginTop: SIZES.spacing.lg,
  },
  inputContainer: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default ProfileCompletionScreen;
