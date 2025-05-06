import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ClubMembership} from '../store/authStore';

export interface GoogleLoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: Record<string, unknown>;
  isProfileCompleted: boolean;
  clubMemberships: ClubMembership[];
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  city: string;
  district: string;
  motorcycleBrand: string;
  motorcycleModel: string;
  motorcycleCc: number;
  profilePicture: string;
  bloodType: string;
  clothingSize: string;
  driverLicenseType: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  role: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  isProfileCompleted: boolean;
  clubMemberships: ClubMembership[];
}

interface NotificationSettings {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  notifyForNewEvents?: boolean;
  notifyForEventUpdates?: boolean;
  // Diğer bildirim ayarları...
}

interface ImageUpload {
  uri: string;
  type: string;
  name: string;
}

class AuthService {
  // Google ile giriş/kayıt
  async loginWithGoogle(idToken: string): Promise<GoogleLoginResponse> {
    try {
      const response = await apiClient.post('/api/v1/auth/google/login', {
        idToken,
      });

      // Token ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem(
        'user_data',
        JSON.stringify(response.data.user),
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Email ile giriş
  async loginWithEmail(
    email: string,
    password: string,
  ): Promise<GoogleLoginResponse> {
    try {
      console.log('📤 API isteği gönderiliyor:', '/api/v1/auth/email/login');

      const response = await apiClient.post('/api/v1/auth/email/login', {
        email,
        password,
      });

      console.log('📥 API yanıtı alındı (ham veri):', response.data);
      console.log(
        '📦 API yanıtı (JSON):',
        JSON.stringify(response.data, null, 2),
      );
      console.log('🔍 clubMemberships:', response.data.clubMemberships);
      console.log('👤 user:', response.data.user);

      // Token ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
      await AsyncStorage.setItem(
        'user_data',
        JSON.stringify({
          ...response.data.user,
          clubMemberships:
            response.data.clubMemberships?.map((membership: any) => ({
              ...membership,
              club: membership.club
                ? {
                    ...membership.club,
                    cover:
                      membership.club.cover ||
                      'https://placehold.co/800x200/darkgray/white?text=Kapak+Fotoğrafı',
                  }
                : null,
            })) || [],
        }),
      );
      await AsyncStorage.setItem(
        'club_memberships',
        JSON.stringify(response.data.clubMemberships || []),
      );

      console.log("💾 AsyncStorage'a kaydedildi:", {
        token: response.data.token ? '✅' : '❌',
        refreshToken: response.data.refreshToken ? '✅' : '❌',
        userData: response.data.user ? '✅' : '❌',
        clubMemberships: response.data.clubMemberships ? '✅' : '❌',
      });

      return response.data;
    } catch (error) {
      console.error('❌ API hatası:', error);
      throw error;
    }
  }

  // Email ile kayıt
  async registerWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post('/api/v1/auth/email/register', {
        email,
        password,
        firstName,
        lastName,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Email doğrulama
  async confirmEmail(token: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post('/api/v1/auth/email/confirm', {
        token,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Şifremi unuttum
  async forgotPassword(email: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post('/api/v1/auth/forgot/password', {
        email,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Şifre sıfırlama
  async resetPassword(
    token: string,
    password: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post('/api/v1/auth/reset/password', {
        token,
        password,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Token yenileme
  async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    try {
      const response = await apiClient.post('/api/v1/auth/refresh', {
        refreshToken,
      });

      // Yeni token'ları kaydet
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('refresh_token', response.data.refreshToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı profili alma
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.get('/api/v1/auth/me');
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Profil bilgilerini güncelleme
  async updateProfile(
    profileData: Partial<UserProfileResponse>,
  ): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.patch('/api/v1/auth/me', profileData);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Profil fotoğrafını güncelleme
  async updateProfilePicture(
    pictureUri: string,
  ): Promise<{profilePicture: string}> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: pictureUri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      } as ImageUpload);

      const response = await apiClient.post(
        '/api/v1/auth/me/profile-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Önbelleğe alınmış kullanıcı verilerini güncelle
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        parsedUserData.profilePicture = response.data.profilePicture;
        await AsyncStorage.setItem('user_data', JSON.stringify(parsedUserData));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Bildirim ayarlarını güncelleme
  async updateNotificationSettings(
    settings: NotificationSettings,
  ): Promise<NotificationSettings> {
    try {
      const response = await apiClient.patch(
        '/api/v1/auth/me/notification-settings',
        settings,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // OneSignal ID güncelleme
  async updateOneSignalPlayerId(playerId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.put('/api/v1/auth/me/onesignal-id', {
        oneSignalPlayerId: playerId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Hesabı silme
  async deleteAccount(): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete('/api/v1/auth/me');

      // Yerel depolama temizliği
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
      ]);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Çıkış
  async logout(): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post('/api/v1/auth/logout');

      // Tüm ilgili storage anahtarlarını temizle
      const keysToRemove = [
        'auth_token',
        'refresh_token',
        'user_data',
        'club_memberships',
      ];

      // Önce tüm storage anahtarlarını al
      const allKeys = await AsyncStorage.getAllKeys();

      // Kullanıcı verilerini içerebilecek diğer anahtarları da ekle
      const additionalKeys = allKeys.filter(
        key =>
          key.includes('user_') ||
          key.includes('club_') ||
          key.includes('auth_') ||
          key.includes('profile_'),
      );

      // Tüm anahtarları birleştir ve temizle
      const allKeysToRemove = [
        ...new Set([...keysToRemove, ...additionalKeys]),
      ];
      await AsyncStorage.multiRemove(allKeysToRemove);

      console.log('🧹 Temizlenen storage anahtarları:', allKeysToRemove);

      return response.data;
    } catch (error) {
      console.error('❌ Logout hatası:', error);
      // API hatası olsa bile yerel depolama temizliğini yap
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'club_memberships',
      ]);
      throw error;
    }
  }

  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Profil tamamlama
  async completeProfile(
    profileData: Partial<UserProfileResponse>,
  ): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.patch(
        '/api/v1/profile-completion/complete',
        profileData,
      );
      await AsyncStorage.setItem(
        'user_data',
        JSON.stringify(response.data.user),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Normal login
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('/api/v1/auth/email/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
