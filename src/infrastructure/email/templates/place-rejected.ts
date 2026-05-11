import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { ctaButton, headingText, bodyText, highlightBox, divider } from './components';

export interface PlaceRejectedData {
  firstName: string;
  placeName: string;
  rejectionReason: string;
  appUrl: string;
}

export function placeRejectedTemplate(data: PlaceRejectedData): {
  subject: string;
  html: string;
} {
  const { firstName, placeName, rejectionReason, appUrl } = data;
  const safeFirstName = escapeHtml(firstName);
  const safePlaceName = escapeHtml(placeName);
  const safeReason = escapeHtml(rejectionReason);
  const addPlaceUrl = `${appUrl}/add-place`;

  const content = `
    ${headingText(`Sobre o ${safePlaceName}`)}
    ${bodyText(`Oi, ${safeFirstName}. Analisamos seu cadastro e precisamos de um ajuste antes de publicar.`)}
    ${bodyText('Veja o que nossos moderadores observaram:')}
    ${highlightBox(safeReason)}
    ${bodyText(
      `Sem frescura — é rapidinho. Faz as correções e cadastra de novo que a gente aprova na hora.`,
    )}
    ${divider()}
    ${ctaButton('Cadastrar novamente', addPlaceUrl)}
  `;

  return {
    subject: `Sobre o ${placeName} — precisamos de mais um ajuste`,
    html: baseTemplate(content, appUrl),
  };
}
