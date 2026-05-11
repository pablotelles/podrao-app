export interface EmailTemplateResult {
  subject: string;
  html: string;
}

export type PlaceEmailEvent = 'submitted' | 'approved' | 'rejected';

export interface PlaceEmailData {
  firstName: string;
  placeName: string;
  placeUrl?: string;
  rejectionReason?: string;
  appUrl: string;
}

export interface IEmailTemplateProvider {
  render(event: PlaceEmailEvent, data: PlaceEmailData): EmailTemplateResult;
}
