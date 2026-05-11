import type {
  IEmailTemplateProvider,
  PlaceEmailEvent,
  PlaceEmailData,
  EmailTemplateResult,
} from '@/domain/interfaces/IEmailTemplateProvider';
import { submissionReceivedTemplate } from './templates/submission-received';
import { placeApprovedTemplate } from './templates/place-approved';
import { placeRejectedTemplate } from './templates/place-rejected';

export class ResendEmailTemplateProvider implements IEmailTemplateProvider {
  render(event: PlaceEmailEvent, data: PlaceEmailData): EmailTemplateResult {
    if (event === 'submitted') {
      return submissionReceivedTemplate({
        firstName: data.firstName,
        placeName: data.placeName,
        appUrl: data.appUrl,
      });
    }

    if (event === 'approved') {
      return placeApprovedTemplate({
        firstName: data.firstName,
        placeName: data.placeName,
        placeUrl: data.placeUrl ?? data.appUrl,
        appUrl: data.appUrl,
      });
    }

    // rejected
    return placeRejectedTemplate({
      firstName: data.firstName,
      placeName: data.placeName,
      rejectionReason: data.rejectionReason ?? '',
      appUrl: data.appUrl,
    });
  }
}
