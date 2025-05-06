import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from '../services';
import {UserProfileResponse} from '../services/authService';

// Zustand türünü düzelt kısmını kaldır - özel SetState tipi sorun çıkarıyor
// type SetState<T> = (
//   partial: T | Partial<T> | ((state: T) => T | Partial<T>),
//   replace?: boolean,
// ) => void;

export interface ClubPermissions {
  canCreateEvent: boolean;
  canManageMembers: boolean;
  canManageCity: boolean;
  canSendAnnouncement: boolean;
  canAddProduct: boolean;
  canManageClub: boolean;
  canRemoveMember: boolean;
  canManageEvents: boolean;
}

interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  type: 'private' | 'public';
  status: 'active' | 'passive';
  isOfficial: boolean;
  memberCount: number;
  isFreeForever: boolean;
  founderId: string;
  createdAt: string;
  updatedAt: string;
  cover: string;
}

export interface ClubMembership {
  id: string;
  userId: string;
  clubId: string;
  clubCityId: string | null;
  rank: string;
  status: string;
  totalKilometers: number;
  customNickname: string | null;
  canCreateEvent: boolean;
  canManageMembers: boolean;
  canManageCity: boolean;
  canSendAnnouncement: boolean;
  canAddProduct: boolean;
  canManageClub: boolean;
  canRemoveMember: boolean;
  canManageEvents: boolean;
  hangaroundStartDate: string | null;
  prospectStartDate: string | null;
  memberStartDate: string;
  createdAt: string;
  updatedAt: string;
  club: Club;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  phoneNumber?: string;
  city?: string;
  district?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleCc?: number;
  profilePicture?: string;
  bloodType?: string;
  clothingSize?: string;
  driverLicenseType?: string;
  role: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  isProfileCompleted: boolean;
  clubMemberships?: ClubMembership[];
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  clubMemberships: ClubMembership[];

  // Eylemler
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
  clubMemberships: [],

  // Email ile giriş
  loginWithEmail: async (email: string, password: string) => {
    try {
      set({isLoading: true, error: null});
      console.log('🔐 Login isteği gönderiliyor:', {email});

      const response = await authService.loginWithEmail(email, password);
      console.log('📦 API Yanıtı:', JSON.stringify(response, null, 2));

      // API yanıtını kontrol et
      if (!response.user) {
        throw new Error('API yanıtında user verisi yok');
      }

      // Kullanıcı verisini hazırla
      const userData = {
        ...response.user,
        clubMemberships: response.clubMemberships || [],
      };

      console.log(
        '🔄 İşlenmiş kullanıcı verisi:',
        JSON.stringify(userData, null, 2),
      );

      set({
        isAuthenticated: true,
        user: userData as User,
        token: response.token,
        clubMemberships: response.clubMemberships || [],
        isLoading: false,
      });

      console.log('✅ Store güncellendi:', {
        isAuthenticated: true,
        user: userData,
        clubMemberships: response.clubMemberships || [],
      });
    } catch (error: unknown) {
      console.error('❌ Login hatası:', error);
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        clubMemberships: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Giriş başarısız',
      });
    }
  },

  // Google ile giriş
  loginWithGoogle: async (idToken: string) => {
    try {
      set({isLoading: true, error: null});
      const response = await authService.loginWithGoogle(idToken);

      // Kullanıcı ve kulüp üyelik verilerini doğru şekilde dönüştür
      const userData = {
        ...response.user,
        clubMemberships: response.clubMemberships || [],
      } as User;

      // Tüm kullanıcı bilgilerini sakla
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('refresh_token', response.refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem(
        'club_memberships',
        JSON.stringify(response.clubMemberships || []),
      );

      set({
        isAuthenticated: true,
        user: userData,
        token: response.token,
        clubMemberships: response.clubMemberships || [],
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        clubMemberships: [],
        isLoading: false,
      });
    }
  },

  // Çıkış
  logout: async () => {
    try {
      set({isLoading: true});
      await authService.logout();

      // Tüm saklanan bilgileri temizle
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'club_memberships',
      ]);

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        clubMemberships: [],
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        clubMemberships: [],
        isLoading: false,
      });
    }
  },

  // Kullanıcı profili alma
  getUserProfile: async () => {
    try {
      set({isLoading: true, error: null});
      const user = await authService.getUserProfile();
      set({user: user as unknown as User, isLoading: false});
    } catch (error: unknown) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Profil bilgileri alınamadı',
      });
    }
  },

  // Profil güncelleme
  updateProfile: async (profileData: Partial<User>) => {
    try {
      set({isLoading: true, error: null});
      const updatedUser = await authService.updateProfile(
        profileData as unknown as Partial<UserProfileResponse>,
      );
      set({user: updatedUser as unknown as User, isLoading: false});
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profil güncellenemedi',
      });
    }
  },

  // Hata temizleme
  clearError: () => set({error: null}),

  // İlk yükleme
  initialize: async () => {
    try {
      set({isLoading: true});

      // Depolanan token ve kullanıcı verilerini al
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      const clubMembershipsData = await AsyncStorage.getItem(
        'club_memberships',
      );

      if (token && userData) {
        set({
          isAuthenticated: true,
          token,
          user: JSON.parse(userData) as User,
          clubMemberships: clubMembershipsData
            ? (JSON.parse(clubMembershipsData) as unknown as ClubMembership[])
            : [],
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          clubMemberships: [],
          isLoading: false,
        });
      }
    } catch (error: unknown) {
      set({
        isAuthenticated: false,
        token: null,
        user: null,
        clubMemberships: [],
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
