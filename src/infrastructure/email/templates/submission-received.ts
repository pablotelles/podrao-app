import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { ctaButton, headingText, bodyText, divider } from './components';

export interface SubmissionReceivedData {
  firstName: string;
  placeName: string;
  appUrl: string;
}

export function submissionReceivedTemplate(data: SubmissionReceivedData): {
  subject: string;
  html: string;
} {
  const { firstName, placeName, appUrl } = data;
  const safeFirstName = escapeHtml(firstName);
  const safePlaceName = escapeHtml(placeName);

  const content = `
    ${headingText(`Recebemos o ${safePlaceName}!`)}
    ${bodyText(`Oi, ${safeFirstName}! A comunidade agradece.`)}
    ${bodyText(
      `Seu cadastro foi recebido e está passando pela nossa curadoria. Em breve você vai saber se o <strong>${safePlaceName}</strong> entrou no mapa do Podrao.`,
    )}
    ${bodyText(`Enquanto isso, dá uma olhada no que rola por aí:`)}
    ${divider()}
    ${ctaButton('Ver o Podrao', appUrl)}
  `;

  return {
    subject: `Recebemos o ${placeName} — a comunidade agradece`,
    html: baseTemplate(content, appUrl),
  };
}
