import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import {
//   GoogleSignin,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';

// // Google Sign-In istemcisini yapılandır
// GoogleSignin.configure({
//   webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Google Cloud Console'dan alın
//   offlineAccess: true,
//   forceCodeForRefreshToken: true,
// });

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const {registerWithEmail, isLoading} = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = () => {
    if (!firstName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı giriniz.');
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert('Hata', 'Lütfen soyadınızı giriniz.');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return false;
    }

    if (!password) {
      Alert.alert('Hata', 'Lütfen şifre giriniz.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerWithEmail(email, password, firstName, lastName);
      // Başarılı kayıt sonrası giriş yapılır ve navigationu AuthContext yönlendirir
    } catch (error: any) {
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
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
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Kayıt Ol</Text>
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Ad"
        placeholderTextColor={colors.text}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Soyad"
        placeholderTextColor={colors.text}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="E-posta"
        placeholderTextColor={colors.text}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Şifre"
        placeholderTextColor={colors.text}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Şifre Tekrar"
        placeholderTextColor={colors.text}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, {backgroundColor: colors.primary}]}
        onPress={handleRegister}>
        <Text style={styles.buttonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      {/* Ayırıcı */}
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, {backgroundColor: colors.border}]} />
        <Text style={[styles.dividerText, {color: colors.text}]}>VEYA</Text>
        <View style={[styles.divider, {backgroundColor: colors.border}]} />
      </View>

      {/* Google ile Kayıt Butonu */}
      {/* <TouchableOpacity
        style={[styles.googleButton, {borderColor: colors.border}]}
        onPress={handleGoogleSignIn}>
        <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
        <Text style={[styles.googleButtonText, {color: colors.text}]}>
          Google ile Kayıt Ol
        </Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.loginText, {color: colors.primary}]}>
          Zaten hesabın var mı? Giriş yap
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
});

export default RegisterScreen;
