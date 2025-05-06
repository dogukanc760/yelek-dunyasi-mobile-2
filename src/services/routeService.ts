import apiClient from './api';

export interface Route {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  distance: number; // kilometre
  elevation: number; // metre
  estimatedDuration: number; // dakika
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  type: 'ROAD' | 'MOUNTAIN' | 'GRAVEL' | 'URBAN' | 'MIXED';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  city: string;
  district?: string;
  isPublic: boolean;
  isFavorite: boolean;
  rating: number; // 1-5 arası
  ratingCount: number;
  popularity: number; // kaç kişi tarafından sürüldüğü
  startPoint: {
    title: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
  endPoint: {
    title: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
  waypoints: Array<{
    title: string;
    latitude: number;
    longitude: number;
    address?: string;
    type?: 'WAYPOINT' | 'WATER' | 'VIEWPOINT' | 'REST' | 'FOOD';
  }>;
  tags: string[];
  surface?: {
    asphalt: number; // yüzde
    gravel: number;
    dirt: number;
    other: number;
  };
  routeData?: {
    origin: {
      latitude: number;
      longitude: number;
    };
    destination: {
      latitude: number;
      longitude: number;
    };
    waypoints: Array<{
      latitude: number;
      longitude: number;
    }>;
    mode: 'DRIVING' | 'BICYCLING' | 'WALKING' | 'TRANSIT';
  };
}

export interface RouteListResponse {
  routes: Route[];
  totalCount: number;
  page: number;
  limit: number;
}

class RouteService {
  // Rotaları listele
  async getRoutes(
    page = 1,
    limit = 10,
    filter?: {
      city?: string;
      district?: string;
      difficulty?: string;
      type?: string;
      distance?: {min?: number; max?: number};
      elevation?: {min?: number; max?: number};
      rating?: number;
      tags?: string[];
      search?: string;
    },
  ): Promise<RouteListResponse> {
    try {
      const response = await apiClient.get('/api/v1/routes', {
        params: {page, limit, ...filter},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rota detayı getir
  async getRouteById(routeId: string): Promise<Route> {
    try {
      const response = await apiClient.get(`/api/v1/routes/${routeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Popüler rotaları getir
  async getPopularRoutes(
    page = 1,
    limit = 5,
    city?: string,
  ): Promise<RouteListResponse> {
    try {
      const response = await apiClient.get('/api/v1/routes/popular', {
        params: {page, limit, city},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının favori rotalarını getir
  async getFavoriteRoutes(page = 1, limit = 10): Promise<RouteListResponse> {
    try {
      const response = await apiClient.get('/api/v1/routes/favorites', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rotayı favorilere ekle
  async addToFavorites(routeId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/routes/${routeId}/favorite`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rotayı favorilerden çıkar
  async removeFromFavorites(routeId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/routes/${routeId}/favorite`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rotaya puan ver
  async rateRoute(
    routeId: string,
    rating: number,
  ): Promise<{success: boolean; newRating: number}> {
    try {
      const response = await apiClient.post(`/api/v1/routes/${routeId}/rate`, {
        rating,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rota oluştur
  async createRoute(routeData: Partial<Route>): Promise<Route> {
    try {
      const response = await apiClient.post('/api/v1/routes', routeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rotayı güncelle
  async updateRoute(
    routeId: string,
    routeData: Partial<Route>,
  ): Promise<Route> {
    try {
      const response = await apiClient.patch(
        `/api/v1/routes/${routeId}`,
        routeData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rotayı sil
  async deleteRoute(routeId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(`/api/v1/routes/${routeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new RouteService();
