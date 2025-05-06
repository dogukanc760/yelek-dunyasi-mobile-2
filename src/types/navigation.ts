export type RootStackParamList = {
  // Auth Routes
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProfileCompletion: undefined;

  // Main Routes
  MainTabs: undefined;
  Home: undefined;
  AnnouncementDetail: {id: string};
  ClubApplications: {clubId: string};
  ManageClub: {
    clubId: string;
    permissions: {
      canManageMembers: boolean;
      canCreateEvent: boolean;
      canManageEvents: boolean;
      canSendAnnouncement: boolean;
      canRemoveMember: boolean;
      canManageClub: boolean;
      canManageCity: boolean;
    };
  };
  ClubMembers: {
    clubId: string;
  };
  ClubEvents: {clubId: string};
  ClubAnnouncements: {clubId: string};
  ClubDetail: {id: string};
  EventDetail: {id: string};
  Events: undefined;
  MyEvents: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ClubsList: undefined;
  Notifications: undefined;
  Teams: undefined;
  TeamDetail: {id: string};
  Routes: undefined;
  RouteDetail: {id: string};
  CreateEvent: {
    clubId: string;
  };
  EditClub: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
