export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Settings: undefined;
  ClubDetail: {id: string};
  EventDetail: {id: string; isEditable?: boolean};
  ClubEvents: {clubId: string};
  ManageClub: {clubId: string};
  CreateClub: undefined;
  CreateEvent: {clubId: string};
  EditEvent: {eventId: string; clubId: string};
  EditClub: {clubId: string};
  ClubMembers: {clubId: string};
  ClubFiles: {clubId: string};
  ClubSettings: {clubId: string};
  ClubInvites: {clubId: string};
  ClubRequests: {clubId: string};
  ClubBans: {clubId: string};
  ClubRoles: {clubId: string};
  ClubPermissions: {clubId: string};
  ClubNotifications: {clubId: string};
  ClubStatistics: {clubId: string};
  ClubReports: {clubId: string};
  ClubLogs: {clubId: string};
  ClubBackups: {clubId: string};
  ClubRestore: {clubId: string};
  ClubDelete: {clubId: string};
  ClubTransfer: {clubId: string};
  ClubMerge: {clubId: string};
  ClubSplit: {clubId: string};
  ClubArchive: {clubId: string};
  ClubUnarchive: {clubId: string};
  ClubExport: {clubId: string};
  ClubImport: {clubId: string};
  ClubTemplates: {clubId: string};
  ClubTemplateCreate: {clubId: string};
  ClubTemplateEdit: {clubId: string; templateId: string};
  ClubTemplateDelete: {clubId: string; templateId: string};
  ClubTemplateUse: {clubId: string; templateId: string};
  ClubTemplateShare: {clubId: string; templateId: string};
  ClubTemplateExport: {clubId: string; templateId: string};
  ClubTemplateImport: {clubId: string};
  ClubTemplateCategories: {clubId: string};
  ClubTemplateCategoryCreate: {clubId: string};
  ClubTemplateCategoryEdit: {clubId: string; categoryId: string};
  ClubTemplateCategoryDelete: {clubId: string; categoryId: string};
  ClubTemplateCategoryMove: {clubId: string; categoryId: string};
  ClubTemplateCategoryMerge: {clubId: string; categoryId: string};
  ClubTemplateCategorySplit: {clubId: string; categoryId: string};
  ClubTemplateCategoryArchive: {clubId: string; categoryId: string};
  ClubTemplateCategoryUnarchive: {clubId: string; categoryId: string};
  ClubTemplateCategoryExport: {clubId: string; categoryId: string};
  ClubTemplateCategoryImport: {clubId: string};
  ClubTemplateCategoryTemplates: {clubId: string; categoryId: string};
  ClubTemplateCategoryTemplateCreate: {clubId: string; categoryId: string};
  ClubTemplateCategoryTemplateEdit: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateDelete: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateUse: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateShare: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateExport: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateImport: {clubId: string; categoryId: string};
  ClubTemplateCategoryTemplateCategories: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateCategoryCreate: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateCategoryEdit: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryDelete: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryMove: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryMerge: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategorySplit: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryArchive: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryUnarchive: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryExport: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryImport: {
    clubId: string;
    categoryId: string;
    templateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplates: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateCreate: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateEdit: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
    templateCategoryTemplateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateDelete: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
    templateCategoryTemplateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateUse: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
    templateCategoryTemplateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateShare: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
    templateCategoryTemplateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateExport: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
    templateCategoryTemplateId: string;
  };
  ClubTemplateCategoryTemplateCategoryTemplateImport: {
    clubId: string;
    categoryId: string;
    templateId: string;
    templateCategoryId: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
