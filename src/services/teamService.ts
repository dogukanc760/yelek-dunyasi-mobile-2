import apiClient from './api';

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  status: string;
  joinedAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  team: {
    id: string;
    name: string;
    logo?: string;
  };
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

class TeamService {
  // Takım listesini getir
  async getTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get('/api/v1/teams');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ID'ye göre takım detayını getir
  async getTeamById(teamId: string): Promise<Team> {
    try {
      const response = await apiClient.get(`/api/v1/teams/by-id/${teamId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının takımlarını getir
  async getMyTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get('/api/v1/teams/my-teams');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının takım davetlerini getir
  async getMyInvitations(): Promise<TeamInvitation[]> {
    try {
      const response = await apiClient.get('/api/v1/teams/my-invitations');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Yeni takım oluştur
  async createTeam(teamData: {
    name: string;
    description?: string;
    logo?: string;
  }): Promise<Team> {
    try {
      const response = await apiClient.post('/api/v1/teams', teamData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takıma üye davet et
  async inviteMember(
    teamId: string,
    invitation: {email: string; role?: string},
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/teams/${teamId}/invites`,
        invitation,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takım davetini kabul et
  async acceptInvitation(
    teamId: string,
    invitationId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/teams/${teamId}/invites/${invitationId}/accept`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takım davetini reddet
  async rejectInvitation(
    teamId: string,
    invitationId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.post(
        `/api/v1/teams/${teamId}/invites/${invitationId}/reject`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Üyeyi takımdan çıkar
  async removeMember(
    teamId: string,
    userId: string,
  ): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/teams/delete-member/${teamId}/${userId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takımdan ayrıl
  async leaveTeam(teamId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/teams/delete-me/${teamId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Takımı sil
  async deleteTeam(teamId: string): Promise<{success: boolean}> {
    try {
      const response = await apiClient.delete(
        `/api/v1/teams/delete-team/${teamId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new TeamService();
