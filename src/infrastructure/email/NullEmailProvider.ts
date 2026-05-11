import type { IEmailProvider, EmailMessage } from '@/domain/interfaces/IEmailProvider';

/**
 * No-op email provider used when RESEND_API_KEY is not configured.
 * Logs the email to the console for local development visibility.
 */
export class NullEmailProvider implements IEmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.log('[NullEmailProvider] Email would be sent:', {
      to: message.to,
      subject: message.subject,
      from: message.from,
    });
  }
}
