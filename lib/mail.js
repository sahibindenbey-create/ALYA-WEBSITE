// E-posta gönderimi (SMTP). Ortam değişkenleri: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
import nodemailer from 'nodemailer';
export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
let transport = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port,
      secure: String(process.env.SMTP_SECURE ?? (port === 465)).toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000,
    });
  }
  return transport;
}
export async function sendLoginCode(to, code) {
  const from = process.env.MAIL_FROM || `ALYA HOMES <${process.env.SMTP_USER}>`;
  const text = `ALYA HOMES giriş kodunuz: ${code}\n\nKod 10 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı dikkate almayın; kimseyle paylaşmayın.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#171717"><h2 style="margin:0 0 16px">ALYA HOMES</h2><p>Giriş kodunuz:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:12px 0">${code}</p><p style="color:#555;font-size:13px">Kod 10 dakika geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı dikkate almayın; kodu kimseyle paylaşmayın.</p></div>`;
  await getTransport().sendMail({ from, to, subject: `ALYA HOMES giriş kodunuz: ${code}`, text, html });
}
