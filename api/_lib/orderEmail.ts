import { Resend } from 'resend';
import type Stripe from 'stripe';

export type OrderEmailData = {
  calculatorName: string;
  amountTotal: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
  recipientEmail: string;
  terminalCity: string;
  terminalAddress: string;
  terminalCode: string;
  sessionId: string;
};

function formatAmount(amountTotal: number | null, currency: string | null): string {
  if (amountTotal == null) return '—';
  const value = (amountTotal / 100).toFixed(2).replace('.', ',');
  return `${value} ${(currency ?? 'eur').toUpperCase()}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildOrderEmailData(session: Stripe.Checkout.Session): OrderEmailData {
  const meta = session.metadata ?? {};

  return {
    calculatorName: meta.calculatorName || meta.calculatorId || 'Skaičiuotuvas',
    amountTotal: formatAmount(session.amount_total, session.currency),
    recipientFirstName: meta.recipientFirstName || '—',
    recipientLastName: meta.recipientLastName || '—',
    recipientPhone: meta.recipientPhone || '—',
    recipientEmail: meta.recipientEmail || session.customer_email || '—',
    terminalCity: meta.terminalCity || '—',
    terminalAddress: meta.terminalAddress || '—',
    terminalCode: meta.terminalCode || meta.terminalId || '—',
    sessionId: session.id,
  };
}

export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  const from = process.env.ORDER_EMAIL_FROM;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!to) {
    throw new Error('ORDER_NOTIFICATION_EMAIL is not configured');
  }
  if (!from) {
    throw new Error('ORDER_EMAIL_FROM is not configured');
  }

  const resend = new Resend(apiKey);
  const fullName = `${data.recipientFirstName} ${data.recipientLastName}`.trim();

  const safe = {
    calculatorName: escapeHtml(data.calculatorName),
    amountTotal: escapeHtml(data.amountTotal),
    fullName: escapeHtml(fullName),
    recipientPhone: escapeHtml(data.recipientPhone),
    recipientEmail: escapeHtml(data.recipientEmail),
    terminalCity: escapeHtml(data.terminalCity),
    terminalAddress: escapeHtml(data.terminalAddress),
    terminalCode: escapeHtml(data.terminalCode),
    sessionId: escapeHtml(data.sessionId),
  };

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Naujas užsakymas: ${data.calculatorName}`,
    replyTo: data.recipientEmail !== '—' ? data.recipientEmail : undefined,
    text: [
      'Naujas skaičiuotuvo užsakymas',
      '',
      `Produktas: ${data.calculatorName}`,
      `Suma: ${data.amountTotal}`,
      '',
      'Gavėjas:',
      `Vardas, pavardė: ${fullName}`,
      `Telefonas: ${data.recipientPhone}`,
      `El. paštas: ${data.recipientEmail}`,
      '',
      'LP Express paštomatas:',
      `Miestas: ${data.terminalCity}`,
      `Adresas: ${data.terminalAddress}`,
      `Kodas: ${data.terminalCode}`,
      '',
      `Stripe sesija: ${data.sessionId}`,
    ].join('\n'),
    html: `
      <h2>Naujas skaičiuotuvo užsakymas</h2>
      <p><strong>Produktas:</strong> ${safe.calculatorName}<br/>
      <strong>Suma:</strong> ${safe.amountTotal}</p>
      <h3>Gavėjas</h3>
      <ul>
        <li><strong>Vardas, pavardė:</strong> ${safe.fullName}</li>
        <li><strong>Telefonas:</strong> ${safe.recipientPhone}</li>
        <li><strong>El. paštas:</strong> ${safe.recipientEmail}</li>
      </ul>
      <h3>LP Express paštomatas</h3>
      <ul>
        <li><strong>Miestas:</strong> ${safe.terminalCity}</li>
        <li><strong>Adresas:</strong> ${safe.terminalAddress}</li>
        <li><strong>Kodas:</strong> ${safe.terminalCode}</li>
      </ul>
      <p style="color:#64748b;font-size:12px;">Stripe sesija: ${safe.sessionId}</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
