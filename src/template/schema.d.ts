export interface Schema {
  componentName: string;
  principalModelName: string;
  principalModelKey: string;
  secondModelName: string;
  secondModelKey: string;
  hasPagination?: boolean;
  hasLinkTo?: boolean;
  hasLinkFrom?: boolean;
}
