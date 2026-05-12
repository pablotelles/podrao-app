import type {
  IEditEmailTemplateProvider,
  EditEmailEvent,
  EditEmailData,
} from '@/domain/interfaces/IEditEmailTemplateProvider';
import type { EmailTemplateResult } from '@/domain/interfaces/IEmailTemplateProvider';
import { editApprovedTemplate } from './templates/edit-approved';
import { editRejectedTemplate } from './templates/edit-rejected';
import { editExpiredTemplate } from './templates/edit-expired';

export class ResendEditEmailTemplateProvider implements IEditEmailTemplateProvider {
  render(event: EditEmailEvent, data: EditEmailData): EmailTemplateResult {
    if (event === 'approved') return editApprovedTemplate(data);
    if (event === 'rejected') return editRejectedTemplate(data);
    return editExpiredTemplate(data);
  }
}
