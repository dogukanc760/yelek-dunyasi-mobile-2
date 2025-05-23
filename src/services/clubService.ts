import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ClubFile {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoUrl?: string;
  cover: string;
  type: 'private' | 'public';
  status: 'active' | 'passive';
  isOfficial: boolean;
  isActive?: boolean;
  isJoined?: boolean;
  memberCount: number;
  isFreeForever: boolean;
  founderId: string;
  createdAt: string;
  updatedAt: string;
  city: string;
  district?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  tags: string[];
  foundedYear: number;
  admins: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  }[];
  permissions?: {
    canCreateEvent: boolean;
    canManageMembers: boolean;
    canManageCity: boolean;
    canSendAnnouncement: boolean;
    canAddProduct: boolean;
    canManageClub: boolean;
    canRemoveMember: boolean;
    canManageEvents: boolean;
  };
  events?: Array<any>;
  announcements?: ClubAnnouncement[];
  members?: ClubMember[];
  founder?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    nickname?: string;
  };
  applications?: ClubApplication[];
  clubFiles?: ClubFile[];
}

export interface ClubListResponse {
  clubs: Club[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ClubAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  attachments?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
}

export interface ClubMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
}

export interface ClubApplication {
  id: string;
  clubId: string;
  userId: string;
  applicationNote: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  club: Club;
}

class ClubService {
  // Kulüpleri listele
  static async getClubs(params: {
    page?: number;
    limit?: number;
    city?: string;
    district?: string;
    search?: string;
    tags?: string[];
    categoryId?: string;
    tagId?: string;
  }): Promise<{isSuccess: boolean; data: Club[]; errors: any}> {
    try {
      const apiResponse = await apiClient.get('/api/v1/clubs', {
        params,
      });
      const clubsArr = Array.isArray(apiResponse.data?.data)
        ? apiResponse.data.data
        : Array.isArray(apiResponse.data?.clubs)
        ? apiResponse.data.clubs
        : [];
      return {
        isSuccess: true,
        data: clubsArr,
        errors: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // Kulüp detaylarını getir
  static async getClubById(clubId: string): Promise<Club> {
    try {
      console.log('\n');
      console.log('🔍 ==========================================');
      console.log('🔍 KULÜP DETAYI İSTENİYOR');
      console.log('🔍 Kulüp ID:', clubId);

      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 Token:', token ? 'Mevcut' : 'Yok');

      if (!token) {
        throw new Error('Token bulunamadı');
      }

      console.log('🔍 API İsteği yapılıyor...');
      const response = await apiClient.get(`/api/v1/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('🔍 API Yanıtı alındı:', response.status);
      console.log(
        '🔍 API Yanıt içeriği:',
        JSON.stringify(response.data, null, 2),
      );

      if (!response.data) {
        console.log('❌ API YANITI BOŞ');
        throw new Error('API yanıtı boş');
      }

      // API yanıtı direkt olarak kulüp verisi içeriyorsa
      const clubData = response.data.data || response.data;

      if (!clubData || !clubData.id) {
        console.log('❌ GEÇERSİZ KULÜP VERİSİ:', clubData);
        throw new Error('Geçersiz kulüp verisi');
      }

      console.log('✅ KULÜP VERİSİ BULUNDU:', clubData.id);
      console.log('🔍 ==========================================');
      console.log('\n');

      return {
        id: clubData.id,
        name: clubData.name,
        description: clubData.description || '',
        logo: clubData.logo,
        logoUrl: clubData.logo,
        cover: clubData.cover || 'https://via.placeholder.com/800x400',
        type: clubData.type?.toLowerCase() || 'public',
        status: clubData.status?.toLowerCase() || 'active',
        isOfficial: clubData.isOfficial || false,
        isActive: clubData.isActive || true,
        memberCount: clubData.memberCount || 0,
        isFreeForever: clubData.isFreeForever || true,
        founderId: clubData.founderId || '',
        createdAt: clubData.createdAt || new Date().toISOString(),
        updatedAt: clubData.updatedAt || new Date().toISOString(),
        city: clubData.city || '',
        district: clubData.district || '',
        socialMedia: clubData.socialMedia || {},
        tags: clubData.tags || [],
        foundedYear: clubData.foundedYear || new Date().getFullYear(),
        admins: clubData.admins || [],
        permissions: clubData.permissions || {
          canCreateEvent: false,
          canManageMembers: false,
          canManageCity: false,
          canSendAnnouncement: false,
          canAddProduct: false,
          canManageClub: false,
          canRemoveMember: false,
          canManageEvents: false,
        },
        events: clubData.events || [],
        announcements: clubData.announcements || [],
        members: clubData.members || [],
        founder: clubData.founder || {},
        applications: clubData.applications || [],
        clubFiles: clubData.clubFiles || [],
      };
    } catch (error: any) {
      console.error('❌ getClubById hatası:', error.message);
      console.error('❌ Hata detayı:', error.response?.data || error);
      throw error;
    }
  }

  // Kulübe katıl
  static async joinClub(clubId: string): Promise<void> {
    try {
      await apiClient.post(`/clubs/${clubId}/join`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Kulübe katılırken bir hata oluştu',
      );
    }
  }

  // Kulüpten ayrıl
  static async leaveClub(clubId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(`/api/v1/clubs/${clubId}/leave`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp oluştur
  static async createClub(
    formData: FormData,
  ): Promise<{isSuccess: boolean; data?: any; errors?: string[]}> {
    try {
      const response = await apiClient.post('/api/v1/clubs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        errors: error.response?.data?.errors || [
          'Kulüp oluşturulurken bir hata oluştu',
        ],
      };
    }
  }

  // Kulüp bilgilerini güncelle
  static async updateClub(
    clubId: string,
    clubData: Partial<Club>,
  ): Promise<Club> {
    try {
      const response = await apiClient.patch(
        `/api/v1/clubs/${clubId}`,
        clubData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp logo/kapak fotoğrafını yükle
  static async uploadClubPhoto(
    clubId: string,
    imageUri: string,
    type: 'logo' | 'cover',
  ): Promise<{imageUrl: string}> {
    try {
      const formData = new FormData();
      formData.append(type === 'logo' ? 'logo' : 'coverPhoto', {
        uri: imageUri,
        type: 'image/jpeg',
        name: type === 'logo' ? 'logo.jpg' : 'cover-photo.jpg',
      });

      const response = await apiClient.post(
        `/api/v1/clubs/${clubId}/${type === 'logo' ? 'logo' : 'cover-photo'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp üyelerini getir
  static async getClubMembers(
    clubId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    isSuccess: boolean;
    data: Array<{
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
      hangaroundStartDate: string | null;
      prospectStartDate: string | null;
      memberStartDate: string | null;
      canManageEvents: boolean;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
      };
      clubCity: any | null;
    }>;
    errors: any | null;
  }> {
    try {
      console.log('🚀 API İsteği:', {
        url: `/api/v1/clubs/${clubId}/members`,
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('auth_token')}`,
        },
      });

      const response = await apiClient.get(`/api/v1/clubs/${clubId}/members`, {
        params: {page, limit},
      });

      console.log('✅ API Yanıtı:', response);
      return response.data;
    } catch (error) {
      console.error('❌ getClubMembers hatası:', error);
      throw error;
    }
  }

  // Kulüp duyurularını getir
  static async getClubAnnouncements(
    clubId: string,
    page = 1,
    limit = 10,
  ): Promise<{announcements: ClubAnnouncement[]; totalCount: number}> {
    try {
      const response = await apiClient.get(
        `/api/v1/clubs/${clubId}/announcements`,
        {
          params: {page, limit},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp duyurusu oluştur
  static async createAnnouncement(
    clubId: string,
    data: {title: string; content: string},
  ): Promise<ClubAnnouncement> {
    try {
      const response = await apiClient.post(
        `/api/v1/clubs/${clubId}/announcements`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının üye olduğu kulüpleri getir
  static async getUserClubs(page = 1, limit = 10): Promise<ClubListResponse> {
    try {
      const response = await apiClient.get('/api/v1/user/clubs', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının yönettiği kulüpleri getir
  static async getUserManagedClubs(
    page = 1,
    limit = 10,
  ): Promise<ClubListResponse> {
    try {
      const response = await apiClient.get('/api/v1/user/managed-clubs', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp başvurularını getir
  static async getClubApplications(
    clubId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: ClubApplication[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get(
        `/api/v1/clubs/${clubId}/applications`,
        {
          params: {page, limit},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp başvurusunu yanıtla
  static async respondToApplication(
    applicationId: string,
    data: {
      status: 'APPROVE' | 'REJECT';
      responseNote?: string;
    },
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.put(
        `/api/v1/clubs/applications/${applicationId}/respond`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının başvurularını getir
  static async getUserApplications(userId: string): Promise<{
    isSuccess: boolean;
    data: ClubApplication[];
    errors: any;
  }> {
    try {
      const response = await apiClient.get(
        `/api/v1/clubs/applications/user/${userId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async submitApplication(
    clubId: string,
    applicationNote: string,
  ): Promise<void> {
    try {
      await apiClient.post(`/api/v1/clubs/apply`, {
        clubId,
        applicationNote,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Başvuru gönderilirken bir hata oluştu',
      );
    }
  }

  static async updateClubMember(
    clubId: string,
    memberId: string,
    data: {
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
    },
  ): Promise<{isSuccess: boolean; data?: any; errors: any | null}> {
    try {
      const response = await apiClient.patch(
        `/api/v1/clubs/${clubId}/members/${memberId}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Üye güncellenirken hata:', error);
      return {
        isSuccess: false,
        errors: [
          error.response?.data?.message || 'Üye güncellenirken bir hata oluştu',
        ],
      };
    }
  }

  static async updateClubDetailsAndFiles(
    clubId: string,
    formData: FormData,
  ): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await apiClient.patch(
        `/api/v1/clubs/${clubId}/details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'updateClubDetailsAndFiles hatası:',
        error.response?.data || error,
      );
      throw error;
    }
  }

  // Kulüp üyesini çıkar
  static async removeMember(
    clubId: string,
    memberId: string,
  ): Promise<{isSuccess: boolean; errors: any | null}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/clubs/${clubId}/members/${memberId}`,
      );
      return {
        isSuccess: true,
        errors: null,
      };
    } catch (error: any) {
      console.error('Üye çıkarılırken hata:', error);
      return {
        isSuccess: false,
        errors: [
          error.response?.data?.message || 'Üye çıkarılırken bir hata oluştu',
        ],
      };
    }
  }
}

export default ClubService;
