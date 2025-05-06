import apiClient from './api';

export interface UploadedFile {
  id: string;
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadOptions {
  uri: string;
  type: string;
  name: string;
}

class FileService {
  // Dosya yükle
  async uploadFile(
    file: FileUploadOptions,
    folder?: string,
  ): Promise<UploadedFile> {
    try {
      const formData = new FormData();
      formData.append('file', file as any);

      if (folder) {
        formData.append('folder', folder);
      }

      const response = await apiClient.post('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Profil resmi yükle
  async uploadProfilePicture(file: FileUploadOptions): Promise<UploadedFile> {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('folder', 'profiles');

      const response = await apiClient.post('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takım logosu yükle
  async uploadTeamLogo(file: FileUploadOptions): Promise<UploadedFile> {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('folder', 'teams');

      const response = await apiClient.post('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Etkinlik görseli yükle
  async uploadEventImage(file: FileUploadOptions): Promise<UploadedFile> {
    try {
      const formData = new FormData();
      formData.append('file', file as any);
      formData.append('folder', 'events');

      const response = await apiClient.post('/api/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Dosya indirme URL'si oluştur
  getFileUrl(path: string): string {
    return `${apiClient.defaults.baseURL}/api/v1/files/${path}`;
  }

  // Dosya indir
  async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/api/v1/files/${path}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new FileService();
