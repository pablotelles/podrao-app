import type { EmailTemplateResult } from './IEmailTemplateProvider';

export type EditEmailEvent = 'approved' | 'rejected' | 'expired';

export interface EditEmailData {
  firstName: string;
  fieldName: string;
  placeUrl: string;
  appUrl: string;
}

export interface IEditEmailTemplateProvider {
  render(event: EditEmailEvent, data: EditEmailData): EmailTemplateResult;
}
