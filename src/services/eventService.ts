import {API_URL} from '../config';
import apiClient from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  scope: string;
  status: string;
  startDate: string;
  endDate: string;
  locationName: string;
  latitude: string;
  longitude: string;
  destinationLocationName: string;
  destinationLatitude: string;
  destinationLongitude: string;
  waypoints: Waypoint[];
  maxParticipants: number;
  isPrivate: boolean;
  tags: string[];
  clubId: string;
  clubCityId: string;
  creatorId: string;
  distance: string;
  travelLink: string;
  targetRanks: string;
  participantCount: number;
  confirmedParticipantCount: number;
  createdAt: string;
  updatedAt: string;
  club: Club;
  creator: User;
  participants: Participant[];
  checkpoints: Checkpoint[];
}

interface Waypoint {
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover: string;
  type: string;
  status: string;
  isOfficial: boolean;
  memberCount: number;
  isActive: boolean;
  isFreeForever: boolean;
  founderId: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  // ... diğer user alanları
}

export interface Participant {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  rejectionReason: string | null;
  kilometers: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Checkpoint {
  id: string;
  name: string;
  type: string;
  orderIndex: number;
  address: string;
  latitude: number;
  longitude: number;
  description: string | null;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  isSuccess: boolean;
  data: {
    data: Event[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  errors: any;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: 'confirmed' | 'pending';
  rejectionReason?: string | null;
  kilometers?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    nickname?: string | null;
  };
}

export interface EventResponse {
  isSuccess: boolean;
  data: Event;
  errors: any;
}

export interface UserClubEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  startLocationLatitude: number;
  startLocationLongitude: number;
  endLocation: string;
  endLocationLatitude: number;
  endLocationLongitude: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  type: string;
  clubName: string;
  creator: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null;
  };
  participants: {
    id: string;
    fullName: string;
    email: string;
    avatar: string | null;
    joinDate: string;
    status: string;
  }[];
  city: {
    id: string;
    name: string;
  };
  club: {
    id: string;
    name: string;
    logo: string;
    type: string;
    memberCount: number;
  };
}

export interface UserClubEventsResponse {
  isSuccess: boolean;
  data: {
    message: string;
    data: {
      participatedEvents: {
        past: UserClubEvent[];
        upcoming: UserClubEvent[];
      };
      nonParticipatedEvents: UserClubEvent[];
    };
  };
  errors: any;
}

class EventService {
  // Etkinlikleri listele
  async getEvents(
    page = 1,
    limit = 10,
    filter?: {
      type?: string;
      startDate?: string;
      endDate?: string;
      city?: string;
      district?: string;
      clubId?: string;
    },
  ): Promise<EventListResponse> {
    try {
      console.log('📤 Events API isteği gönderiliyor:', {
        endpoint: '/api/v1/events',
        params: {page, limit, ...filter},
      });

      const response = await apiClient.get('/api/v1/events', {
        params: {page, limit, ...filter},
      });

      console.log(
        '📥 Events API yanıtı:',
        JSON.stringify(response.data, null, 2),
      );

      // API yanıtını kontrol et ve dönüştür
      if (response.data && response.data.data) {
        return {
          isSuccess: true,
          data: response.data,
          errors: null,
        };
      }

      // Eğer veri yoksa boş array döndür
      return {
        isSuccess: true,
        data: {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        },
        errors: null,
      };
    } catch (error) {
      console.error('❌ Events API hatası:', error);
      return {
        isSuccess: false,
        data: {
          data: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        },
        errors: error,
      };
    }
  }

  // Etkinlik detayı getir
  async getEventById(eventId: string): Promise<EventResponse> {
    try {
      const response = await apiClient.get(`/api/v1/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlik katılımcılarını getir
  async getEventParticipants(
    eventId: string,
    page = 1,
    limit = 20,
  ): Promise<{participants: EventParticipant[]; totalCount: number}> {
    try {
      const response = await apiClient.get(
        `/api/v1/events/${eventId}/participants`,
        {
          params: {page, limit},
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlik oluştur
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const response = await apiClient.post('/api/v1/events', eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlik güncelle
  async updateEvent(
    eventId: string,
    eventData: Partial<Event>,
  ): Promise<Event> {
    try {
      const response = await apiClient.patch(
        `/api/v1/events/${eventId}`,
        eventData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlik kapak fotoğrafı yükle
  async uploadEventCoverPhoto(
    eventId: string,
    imageUri: string,
  ): Promise<{imageUrl: string}> {
    try {
      const formData = new FormData();
      formData.append('coverPhoto', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'cover-photo.jpg',
      });

      const response = await apiClient.post(
        `/api/v1/events/${eventId}/cover-photo`,
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

  // Etkinliğe katılma isteği gönder
  async joinEvent(
    eventId: string,
  ): Promise<{success: boolean; message: string}> {
    try {
      const response = await apiClient.post(`/api/v1/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlikten ayrıl
  async leaveEvent(eventId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(`/api/v1/events/${eventId}/leave`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinliği iptal et (organizatör)
  async cancelEvent(eventId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(`/api/v1/events/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinliği sil
  async deleteEvent(eventId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(`/api/v1/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinliğe katılım isteğini onayla (organizatör)
  async approveParticipant(
    eventId: string,
    userId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/events/${eventId}/participants/${userId}/approve`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlikten katılımcı çıkar (organizatör)
  async removeParticipant(
    eventId: string,
    userId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/events/${eventId}/participants/${userId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının katıldığı etkinlikleri getir
  async getUserEvents(
    status: 'UPCOMING' | 'COMPLETED' | 'ALL' = 'ALL',
    page = 1,
    limit = 10,
  ): Promise<EventListResponse> {
    try {
      const response = await apiClient.get('/api/v1/user/events', {
        params: {status, page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının düzenlediği etkinlikleri getir
  async getUserOrganizedEvents(
    status: 'UPCOMING' | 'COMPLETED' | 'ALL' = 'ALL',
    page = 1,
    limit = 10,
  ): Promise<EventListResponse> {
    try {
      const response = await apiClient.get('/api/v1/user/organized-events', {
        params: {status, page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kulübün etkinliklerini getir
  async getClubEvents(
    clubId: string,
    status: 'UPCOMING' | 'COMPLETED' | 'ALL' = 'ALL',
    page = 1,
    limit = 10,
  ): Promise<EventListResponse> {
    try {
      const response = await apiClient.get(`/api/v1/clubs/${clubId}/events`, {
        params: {
          status,
          page,
          limit,
        },
      });

      if (!response.data) {
        throw new Error('Etkinlikler alınamadı');
      }

      return response.data;
    } catch (error) {
      console.error('getClubEvents error:', error);
      throw error;
    }
  }
  async getClubEventsForManagement(
    clubId: string,
    status: 'UPCOMING' | 'COMPLETED' | 'ALL' = 'ALL',
    page = 1,
    limit = 10,
  ): Promise<EventListResponse> {
    try {
      const response = await apiClient.get(`/api/v1/events?clubId=${clubId}`, {
        /* params: {
          status,
          page,
          limit,
        },*/
      });

      if (!response.data) {
        throw new Error('Etkinlikler alınamadı');
      }

      return response.data;
    } catch (error) {
      console.error('getClubEvents error:', error);
      throw error;
    }
  }

  async getUserClubEvents(userId: string): Promise<UserClubEventsResponse> {
    try {
      const response = await apiClient.get(
        `/api/v1/clubs/user/${userId}/events`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateEvent(
    clubId: string,
    eventId: string,
    eventData: Partial<Event>,
  ): Promise<Event> {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/api/v1/clubs/${clubId}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventData),
        },
      );

      if (!response.ok) {
        throw new Error('Etkinlik güncellenemedi');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('updateEvent error:', error);
      throw error;
    }
  }
}

export default new EventService();
