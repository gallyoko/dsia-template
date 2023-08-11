export interface Schema {
  moduleLibName: string;
  moduleGitName: string;
  moduleI18nName: string;
  componentName: string;
  principalModelName: string;
  principalModelKey: string;
  principalModelCrud: boolean;
  secondModelName: string;
  secondModelKey: string;
  secondModelCrud: boolean;
  hasPagination?: boolean;
  hasLinkTo?: boolean;
  hasLinkFrom?: boolean;
}
