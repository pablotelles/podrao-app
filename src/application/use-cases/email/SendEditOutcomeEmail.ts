import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import type { IEmailProvider } from '@/domain/interfaces/IEmailProvider';
import type { IEditEmailTemplateProvider } from '@/domain/interfaces/IEditEmailTemplateProvider';

export type EditEmailEvent = 'approved' | 'rejected' | 'expired';

export interface SendEditOutcomeEmailDTO {
  editId: string;
  event: EditEmailEvent;
}

export class SendEditOutcomeEmail {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly userRepo: IUserRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly templateProvider: IEditEmailTemplateProvider,
    private readonly appUrl: string,
  ) {}

  async execute(dto: SendEditOutcomeEmailDTO): Promise<void> {
    try {
      const edit = await this.editRepo.findById(dto.editId);
      if (!edit) {
        console.error(`[SendEditOutcomeEmail] Edit not found: ${dto.editId}`);
        return;
      }

      const user = await this.userRepo.findById(edit.userId);
      if (!user?.email) {
        console.error(
          `[SendEditOutcomeEmail] User not found or has no email. editId=${dto.editId} userId=${edit.userId}`,
        );
        return;
      }

      const firstName = user.name?.split(' ')[0] ?? user.nickname ?? 'você';
      const placeUrl = `${this.appUrl}/places/${edit.placeId}`;

      const { subject, html } = this.templateProvider.render(dto.event, {
        firstName,
        fieldName: edit.fieldName,
        placeUrl,
        appUrl: this.appUrl,
      });

      await this.emailProvider.send({ to: user.email, subject, html });
    } catch (err) {
      // Fail-soft: email failure must NEVER block edit operations
      console.error('[SendEditOutcomeEmail] Failed to send email:', err);
    }
  }
}
