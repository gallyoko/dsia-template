export interface Schema {
  moduleGitName: string;
  moduleI18nName: string;
  componentName: string;
  principalModelName: string;
  principalModelKey: string;
  secondModelName: string;
  secondModelKey: string;
  hasPagination?: boolean;
  hasLinkTo?: boolean;
  hasLinkFrom?: boolean;
}
