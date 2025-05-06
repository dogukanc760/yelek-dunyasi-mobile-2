import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService, userService, profileCompletionService} from '../services';
import {UserProfileResponse} from '../services/authService';
import {ProfileCompletionStatus} from '../services/profileCompletionService';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export type User = UserProfileResponse;

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateProfilePicture: (
    pictureUri: string,
  ) => Promise<{profilePicture: string}>;
  deleteAccount: () => Promise<void>;
  checkProfileCompletion: () => Promise<ProfileCompletionStatus>;
  completeProfile: (profileData: Partial<User>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('auth_token');

      if (token) {
        // Token varsa kullanıcı bilgilerini getir
        const userData = await userService.getCachedUserData();
        if (userData) {
          setUser(userData as unknown as User);
          setIsAuthenticated(true);
        } else {
          // Önbellekte veri yoksa API'den al
          await refreshUserProfile();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Kimlik doğrulama durumu kontrol edilirken hata:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await authService.getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Kullanıcı profili alınırken hata:', error);
      // Hata durumunda çıkış yap
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Login isteği başlatıldı:', {email});

      // Giriş öncesi cache'i temizle
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        key =>
          key.includes('user_') ||
          key.includes('club_') ||
          key.includes('auth_') ||
          key.includes('profile_'),
      );
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(
        '🧹 Giriş öncesi temizlenen cache anahtarları:',
        keysToRemove,
      );

      const response = await authService.loginWithEmail(email, password);
      console.log('📦 Login yanıtı:', JSON.stringify(response, null, 2));

      setUser(response.user as unknown as User);
      setIsAuthenticated(true);

      console.log('👤 Kullanıcı state güncellendi:', {
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('❌ Login hatası:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      // Güncel API, signIn'den sonra getTokens() çağrısı gerektirir
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      if (tokens && tokens.idToken) {
        // Giriş öncesi cache'i temizle
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(
          key =>
            key.includes('user_') ||
            key.includes('club_') ||
            key.includes('auth_') ||
            key.includes('profile_'),
        );
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(
          '🧹 Giriş öncesi temizlenen cache anahtarları:',
          keysToRemove,
        );

        const response = await authService.loginWithGoogle(tokens.idToken);
        setUser(response.user as unknown as User);
        setIsAuthenticated(true);
      } else {
        throw new Error('Google girişi başarısız: ID token bulunamadı');
      }
    } catch (error: any) {
      console.error('Google ile giriş yapılırken hata:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Kullanıcı girişi iptal etti');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Giriş işlemi zaten devam ediyor');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Servisleri mevcut değil');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    try {
      setIsLoading(true);
      await authService.registerWithEmail(email, password, firstName, lastName);
      // Kayıt başarılı ise otomatik giriş yap
      await loginWithEmail(email, password);
    } catch (error) {
      console.error('Kayıt olunurken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      // Hata olsa bile yerel verileri temizle
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (pictureUri: string) => {
    try {
      setIsLoading(true);
      const result = await authService.updateProfilePicture(pictureUri);

      // Kullanıcı bilgilerini güncellemek için profili yenile
      await refreshUserProfile();

      return result;
    } catch (error) {
      console.error('Profil resmi güncellenirken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      await authService.deleteAccount();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Hesap silinirken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkProfileCompletion = async () => {
    try {
      setIsLoading(true);
      return await profileCompletionService.checkStatus();
    } catch (error) {
      console.error('Profil tamamlama kontrolü yapılırken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      const result = await profileCompletionService.completeProfile(
        profileData,
      );
      setUser(result);
    } catch (error) {
      console.error('Profil tamamlanırken hata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
        updateProfile,
        updateProfilePicture,
        deleteAccount,
        checkProfileCompletion,
        completeProfile,
        refreshUserProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
