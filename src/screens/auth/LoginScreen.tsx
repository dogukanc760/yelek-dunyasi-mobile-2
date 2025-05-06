import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// GoogleSignin.configure artık App.tsx dosyasında yapılıyor

const LoginScreen = ({navigation}: Props) => {
  const {loginWithEmail, loginWithGoogle, isLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre giriniz.');
      return;
    }

    try {
      console.log('🔑 Login başlatılıyor:', {email});
      setIsSubmitting(true);
      await loginWithEmail(email, password);
      console.log('✅ Login başarılı!');
    } catch (error: any) {
      console.error('❌ Login hatası:', error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
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

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();

      // AuthContext içindeki loginWithGoogle'ı direk çağırıyoruz
      // Çünkü içinde gerekli token çekilme işlemleri var
      await loginWithGoogle();
    } catch (error: any) {
      let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.' + error;

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Google giriş işlemi iptal edildi';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Google giriş işlemi zaten devam ediyor';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Servisleri kullanılamıyor';
      } else if (
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Lütfen bekleyin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Yelek Dünyası</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>

      {/* Ayırıcı */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>VEYA</Text>
        <View style={styles.divider} />
      </View>

      {/* Google ile Giriş Butonu */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
        <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  logo: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333333',
  },
  input: {
    height: 50,
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#1E88E5', // Material Blue 600
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
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#8E8E8E',
    fontWeight: 'bold',
  },
  googleButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#1E88E5', // Material Blue 600
  },
});

export default LoginScreen;
