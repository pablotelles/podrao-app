import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import type { IEmailProvider } from '@/domain/interfaces/IEmailProvider';
import type { IEmailTemplateProvider } from '@/domain/interfaces/IEmailTemplateProvider';

export type PlaceEmailEvent = 'submitted' | 'approved' | 'rejected';

export interface SendPlaceLifecycleEmailDTO {
  placeId: string;
  event: PlaceEmailEvent;
  rejectionReason?: string;
}

export class SendPlaceLifecycleEmail {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly userRepo: IUserRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly templateProvider: IEmailTemplateProvider,
    private readonly appUrl: string,
  ) {}

  async execute(dto: SendPlaceLifecycleEmailDTO): Promise<void> {
    try {
      const place = await this.placeRepo.findById(dto.placeId);
      if (!place) {
        console.error(`[SendPlaceLifecycleEmail] Place not found: ${dto.placeId}`);
        return;
      }

      if (!place.createdBy) {
        console.error(`[SendPlaceLifecycleEmail] Place has no createdBy: ${dto.placeId}`);
        return;
      }

      const user = await this.userRepo.findById(place.createdBy);
      if (!user || !user.email) {
        console.error(
          `[SendPlaceLifecycleEmail] User not found or has no email. placeId=${dto.placeId} createdBy=${place.createdBy}`,
        );
        return;
      }

      const firstName = user.name?.split(' ')[0] ?? user.nickname ?? 'você';

      if (dto.event === 'rejected' && !dto.rejectionReason) {
        console.error(
          `[SendPlaceLifecycleEmail] rejectionReason required for 'rejected' event, placeId: ${dto.placeId}`,
        );
        return;
      }

      const { subject, html } = this.templateProvider.render(dto.event, {
        firstName,
        placeName: place.name,
        placeUrl: `${this.appUrl}/places/${place.id}`,
        rejectionReason: dto.rejectionReason,
        appUrl: this.appUrl,
      });

      await this.emailProvider.send({
        to: user.email,
        subject,
        html,
      });
    } catch (err) {
      // Fail-soft: email failure must NEVER block place operations
      console.error('[SendPlaceLifecycleEmail] Failed to send email:', err);
    }
  }
}
