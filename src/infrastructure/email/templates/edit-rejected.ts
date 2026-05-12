import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { headingText, bodyText, divider, ctaButton } from './components';

export interface EditRejectedData {
  firstName: string;
  fieldName: string;
  placeUrl: string;
  appUrl: string;
}

export function editRejectedTemplate(data: EditRejectedData): { subject: string; html: string } {
  const safeFirstName = escapeHtml(data.firstName);
  const safeFieldName = escapeHtml(data.fieldName);

  const content = `
    ${headingText('Proposta não aprovada')}
    ${bodyText(`Olá, ${safeFirstName}!`)}
    ${bodyText(
      `A sua proposta de edição do campo <strong>${safeFieldName}</strong> não atingiu consenso na comunidade e foi recusada. O lugar continua com o valor anterior.`,
    )}
    ${divider()}
    ${bodyText('Tem certeza que a informação está desatualizada? Tente novamente quando tiver mais contexto.')}
    ${ctaButton('Ver o lugar', data.placeUrl)}
  `;

  return {
    subject: 'Sua proposta de edição não foi aprovada',
    html: baseTemplate(content, data.appUrl),
  };
}
