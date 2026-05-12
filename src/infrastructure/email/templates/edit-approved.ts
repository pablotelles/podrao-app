import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { ctaButton, headingText, bodyText } from './components';

export interface EditApprovedData {
  firstName: string;
  fieldName: string;
  placeUrl: string;
  appUrl: string;
}

export function editApprovedTemplate(data: EditApprovedData): { subject: string; html: string } {
  const safeFirstName = escapeHtml(data.firstName);
  const safeFieldName = escapeHtml(data.fieldName);

  const content = `
    ${headingText('Sua proposta foi aprovada!')}
    ${bodyText(`Boa, ${safeFirstName}!`)}
    ${bodyText(
      `A comunidade confirmou a sua edição do campo <strong>${safeFieldName}</strong>. O lugar já está atualizado no Podrao.`,
    )}
    ${ctaButton('Ver o lugar atualizado', data.placeUrl)}
  `;

  return {
    subject: 'Sua proposta de edição foi aprovada',
    html: baseTemplate(content, data.appUrl),
  };
}
