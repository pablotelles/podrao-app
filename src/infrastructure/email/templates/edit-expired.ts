import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { headingText, bodyText, ctaButton } from './components';

export interface EditExpiredData {
  firstName: string;
  fieldName: string;
  placeUrl: string;
  appUrl: string;
}

export function editExpiredTemplate(data: EditExpiredData): { subject: string; html: string } {
  const safeFirstName = escapeHtml(data.firstName);
  const safeFieldName = escapeHtml(data.fieldName);

  const content = `
    ${headingText('Sua proposta expirou')}
    ${bodyText(`Olá, ${safeFirstName}!`)}
    ${bodyText(
      `A sua proposta de edição do campo <strong>${safeFieldName}</strong> não recebeu votos suficientes dentro do prazo e foi encaminhada para revisão pelo time do Podrao.`,
    )}
    ${bodyText('Nossa equipe vai analisar e pode aprovar ou recusar a mudança em breve.')}
    ${ctaButton('Ver o lugar', data.placeUrl)}
  `;

  return {
    subject: 'Sua proposta de edição expirou e foi encaminhada para revisão',
    html: baseTemplate(content, data.appUrl),
  };
}
