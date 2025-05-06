import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';
import { useAuthStore } from '../../store';
import { Button } from '../ui';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen: React.FC = () => {
  const { loginWithGoogle, isLoading, error } = useAuthStore();
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // Google giriş işlemi
  const handleGoogleLogin = async () => {
    try {
      // Not: Gerçek uygulamada burada Google Sign-In entegrasyonu yapılmalıdır
      // Bu örnek için basitçe hard-coded bir idToken kullanıyoruz
      const mockIdToken =
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiYjk2MDVjMzZlOThlM...';
      await loginWithGoogle(mockIdToken);
    } catch (error) {
      Alert.alert(
        'Hata',
        'Google ile giriş yapılamadı. Lütfen tekrar deneyin.',
      );
    }
  };

  // Hata olursa göster
  React.useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
    }
  }, [error]);

  // Karşılama ekranı
  if (showWelcomeScreen) {
    return (
      <LinearGradient
        colors={[
          COLORS.instagramPurple,
          COLORS.instagramPurpleLight,
          COLORS.instagramBlue,
        ]}
        style={styles.welcomeContainer}
      >
        <View style={styles.welcomeContent}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.welcomeLogo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeTitle}>Yelekli Dünyası'na</Text>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
          <Text style={styles.welcomeSubtitle}>
            Motosiklet tutkunlarının bir araya geldiği platform
          </Text>

          <View style={styles.welcomeFooter}>
            <Button
              title="Başla"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => setShowWelcomeScreen(false)}
            />
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Giriş ekranı
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Yelekli Dünyası</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.socialButtonsContainer}>
              <Button
                title="Google ile devam et"
                variant="outline"
                fullWidth
                onPress={handleGoogleLogin}
                isLoading={isLoading}
                style={styles.socialButton}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.helpLink}
              onPress={() =>
                Alert.alert(
                  'Bilgi',
                  "Yelekli Dünyası'na hoş geldiniz. Google hesabınız ile giriş yapabilirsiniz.",
                )
              }
            >
              <Text style={styles.helpLinkText}>Yardım mı gerekiyor?</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Giriş yaparak, Kullanım Şartları ve Gizlilik Politikasını kabul
                etmiş olursunuz.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.xl * 2,
    marginBottom: SIZES.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  } as ImageStyle,
  logoText: {
    ...FONTS.h2,
    color: COLORS.text,
    marginTop: SIZES.spacing.md,
  } as TextStyle,
  formContainer: {
    marginTop: SIZES.spacing.xl,
  },
  socialButtonsContainer: {
    marginTop: SIZES.spacing.xl,
  },
  socialButton: {
    marginBottom: SIZES.spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.spacing.md,
  } as TextStyle,
  helpLink: {
    alignSelf: 'center',
    marginTop: SIZES.spacing.xl,
  },
  helpLinkText: {
    ...FONTS.body2,
    color: COLORS.primary,
  } as TextStyle,
  footerContainer: {
    marginTop: SIZES.spacing.xl * 2,
  },
  footerText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  welcomeContainer: {
    flex: 1,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl * 2,
  },
  welcomeLogo: {
    width: 150,
    height: 150,
    marginBottom: SIZES.spacing.xl,
  } as ImageStyle,
  welcomeTitle: {
    ...FONTS.h1,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  } as TextStyle,
  welcomeSubtitle: {
    ...FONTS.body1,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
    opacity: 0.9,
  } as TextStyle,
  welcomeFooter: {
    position: 'absolute',
    bottom: SIZES.spacing.xl * 2,
    left: SIZES.spacing.xl * 2,
    right: SIZES.spacing.xl * 2,
  },
});

export default LoginScreen;
