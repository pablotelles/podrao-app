import { EMAIL_BRAND } from '../emailTokens';

/**
 * Base HTML email wrapper.
 * All styles are inline — no <style> blocks, no external links.
 * Uses table layout for Outlook compatibility.
 * Font: Arial (not Inter — not supported by Gmail/Outlook).
 * Max-width: 600px.
 */
export function baseTemplate(content: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Podrao</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background-color:${EMAIL_BRAND};border-radius:8px 8px 0 0;padding:24px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:-0.02em;">Podrao</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px;border-left:1px solid #d1d5db;border-right:1px solid #d1d5db;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f7;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">Podrao — Comida boa, preço justo.</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">
                <a href="${appUrl}/unsubscribe" style="color:#6b7280;text-decoration:underline;">Descadastrar</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
