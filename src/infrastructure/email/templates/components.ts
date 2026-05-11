/**
 * Reusable HTML email components.
 * All styles inline — no CSS classes.
 */

import { escapeHtml } from '../escapeHtml';
import { EMAIL_ACCENT } from '../emailTokens';

export function ctaButton(text: string, href: string): string {
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td>
      <a href="${safeHref}"
         style="background-color:${EMAIL_ACCENT};color:#ffffff;border-radius:6px;padding:12px 24px;text-decoration:none;display:inline-block;font-weight:bold;font-size:14px;font-family:Arial,Helvetica,sans-serif;"
      >${text}</a>
    </td>
  </tr>
</table>`;
}

export function headingText(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:bold;color:#111827;line-height:1.25;">${text}</h1>`;
}

export function bodyText(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

export function highlightBox(content: string): string {
  return `<div style="background-color:#fef2f2;border-left:4px solid ${EMAIL_ACCENT};border-radius:4px;padding:16px 20px;margin:0 0 24px;">
  <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">${content}</p>
</div>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #d1d5db;margin:24px 0;" />`;
}
