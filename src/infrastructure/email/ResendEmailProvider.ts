import { Resend } from 'resend';
import type { IEmailProvider, EmailMessage } from '@/domain/interfaces/IEmailProvider';

export class ResendEmailProvider implements IEmailProvider {
  private readonly client: Resend;
  private readonly from: string;
  private readonly devOverride: string | undefined;

  constructor(apiKey: string, from: string, devOverride?: string) {
    this.client = new Resend(apiKey);
    this.from = from;
    this.devOverride = devOverride;
  }

  async send(message: EmailMessage): Promise<void> {
    const to =
      this.devOverride && process.env.NODE_ENV !== 'production' ? this.devOverride : message.to;

    const { data, error } = await this.client.emails.send({
      from: message.from ?? this.from,
      to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`[email] sent "${message.subject}" → ${to} (id: ${data?.id})`);
  }
}
