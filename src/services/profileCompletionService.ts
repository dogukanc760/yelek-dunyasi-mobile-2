import apiClient from './api';
import {UserProfileResponse} from './authService';

export interface ProfileCompletionStatus {
  isProfileCompleted: boolean;
  requiredFields: string[];
  completedFields: string[];
  missingFields: string[];
}

class ProfileCompletionService {
  // Profil tamamlama durumunu kontrol et
  async checkStatus(): Promise<ProfileCompletionStatus> {
    try {
      const response = await apiClient.get('/api/v1/profile-completion/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Profil bilgilerini tamamla
  async completeProfile(
    profileData: Partial<UserProfileResponse>,
  ): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.patch(
        '/api/v1/profile-completion/complete',
        profileData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProfileCompletionService();
