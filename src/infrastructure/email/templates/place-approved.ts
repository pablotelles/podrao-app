import { escapeHtml } from '../escapeHtml';
import { baseTemplate } from './base';
import { ctaButton, headingText, bodyText, divider } from './components';

export interface PlaceApprovedData {
  firstName: string;
  placeName: string;
  placeUrl: string;
  appUrl: string;
}

export function placeApprovedTemplate(data: PlaceApprovedData): {
  subject: string;
  html: string;
} {
  const { firstName, placeName, placeUrl, appUrl } = data;
  const safeFirstName = escapeHtml(firstName);
  const safePlaceName = escapeHtml(placeName);

  const content = `
    ${headingText(`${safePlaceName} está no mapa!`)}
    ${bodyText(`Boa, ${safeFirstName}!`)}
    ${bodyText(
      `O <strong>${safePlaceName}</strong> foi aprovado e já aparece para todo mundo no Podrao. Agora é só torcer pra galera achar e arrasar nas avaliações.`,
    )}
    ${divider()}
    ${ctaButton(`Ver o ${safePlaceName} no mapa`, placeUrl)}
  `;

  return {
    subject: `${placeName} está no mapa!`,
    html: baseTemplate(content, appUrl),
  };
}
