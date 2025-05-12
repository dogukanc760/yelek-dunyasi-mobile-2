import apiClient from './api';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  clubId: string;
  createdById: string;
  targetCityId?: string;
  scope?: string;
  targetRanks?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role?: {
      id: number;
      name: string;
      __entity: string;
    };
    status?: {
      id: number;
      name: string;
      __entity: string;
    };
    __entity?: string;
  };
  targetCity?: {
    id: string;
    clubId: string;
    cityId: string;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AnnouncementListResponse {
  isSuccess: boolean;
  data: {
    data: Announcement[];
    total: number;
    page: number;
    limit: number;
  };
  errors: null | any;
}

class AnnouncementService {
  // Duyuruları listele
  async getAnnouncements(
    page = 1,
    limit = 10,
    filter?: {
      isRead?: boolean;
      isImportant?: boolean;
      type?: 'GENERAL' | 'EVENT' | 'CLUB' | 'SYSTEM';
      publisherId?: string;
    },
  ): Promise<AnnouncementListResponse> {
    try {
      const response = await apiClient.get('/api/v1/announcements', {
        params: {page, limit, ...filter},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Duyuru detayı getir
  async getAnnouncementById(announcementId: string): Promise<Announcement> {
    try {
      const response = await apiClient.get(
        `/api/v1/announcements/${announcementId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Duyuruyu okundu olarak işaretle
  async markAsRead(announcementId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/announcements/${announcementId}/read`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Tüm duyuruları okundu olarak işaretle
  async markAllAsRead(): Promise<{success: boolean; count: number}> {
    try {
      const response = await apiClient.post('/api/v1/announcements/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Duyuru oluştur (admin ve kulüp yöneticileri için)
  async createAnnouncement(
    announcementData: Partial<Announcement>,
  ): Promise<Announcement> {
    try {
      const response = await apiClient.post(
        '/api/v1/announcements',
        announcementData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Duyuruyu güncelle (admin ve kulüp yöneticileri için)
  async updateAnnouncement(
    announcementId: string,
    announcementData: Partial<Announcement>,
  ): Promise<Announcement> {
    try {
      const response = await apiClient.patch(
        `/api/v1/announcements/${announcementId}`,
        announcementData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Duyuruyu sil (admin ve kulüp yöneticileri için)
  async deleteAnnouncement(
    announcementId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/announcements/${announcementId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının okunmamış duyuru sayısını getir
  async getUnreadCount(): Promise<{count: number}> {
    try {
      const response = await apiClient.get(
        '/api/v1/announcements/unread-count',
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulüp duyurularını getir
  async getClubAnnouncements(
    clubId: string,
    page = 1,
    limit = 10,
  ): Promise<AnnouncementListResponse> {
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

  // YENİ: Kulübe özel duyuru oluştur
  async createClubAnnouncement(
    clubId: string,
    announcementData: {title: string; content: string; priority: string},
  ): Promise<Announcement> {
    // Dönen tip Announcement varsayılıyor, API dokümanına göre güncellenebilir
    try {
      const response = await apiClient.post(
        `/api/v1/clubs/${clubId}/announcements`,
        announcementData,
      );
      return response.data; // API'den dönen duyuru objesini döndür
    } catch (error) {
      // Hata detaylarını loglama veya kullanıcıya gösterme işlemleri burada yapılabilir
      console.error(
        `Kulüp [${clubId}] için duyuru oluşturulurken hata:`,
        error,
      );
      throw error; // Hatanın üst katmanlarda yakalanabilmesi için tekrar fırlat
    }
  }
}

export default new AnnouncementService();
