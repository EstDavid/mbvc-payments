import { Language } from '@/types/payment';
import nodemailer from 'nodemailer';
import { requireEnv } from '@/lib/utils/server';

const rejectUnauthorized = requireEnv('EMAIL_REJECT_UNAUTHORIZED');
const secure = requireEnv('EMAIL_SECURE');
const host = requireEnv('EMAIL_HOST');
const user = requireEnv('EMAIL_USER');
const pass = requireEnv('EMAIL_PASS');
const port = requireEnv('EMAIL_PORT');
const from = requireEnv('EMAIL_FROM');

const transporter = nodemailer.createTransport({
  host,
  port: parseInt(port),
  secure: secure !== 'FALSE',
  requireTLS: true,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: rejectUnauthorized !== 'FALSE'
  }
});

type EmailData = {
  to: string;
  name: string;
  orderNumber: string;
  description: string;
  amount: string;
};

export async function sendEmail (t: Record<string, string>, language: Language, data: EmailData) {
  const {
    to,
    name,
    orderNumber,
    description,
    amount
  } = data;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: t.subject,
      attachments: [
        {
          filename: "logo_small.png",
          path: "./public/logo.png",
          cid: "logo@nodemailer"
        },
        {
          filename: "bizum-logo.png",
          path: "./public/bizum-logo.png",
          cid: "bizumlogo@nodemailer"
        }
      ],
      text: `
          Montgó Beach Volley Club
    
          ${t.hello}${name}${t.thankYouHereIsReceipt}
    
          ${t.bizumPaymentReceipt}
    
          ${t.orderNumber}: ${orderNumber} ${t.description}: ${description} ${t.amount}: ${amount} €
    
          ${t.paidWith} Bizum
    
          ${t.thankYouForTrustingUs} ${t.anyQuestions}
        `,
      html: `
          <html lang="${language}">
      
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${t.paymentReceipt} - Montgó Beach Volley Club</title>
          </head>
      
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px;">
                    <!-- Header -->
                    <tr>
                      <td style="background: #156082; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <img src="cid:logo@nodemailer" alt="Montgó Beach Volley Club Logo"
                          style="height: 72px; width: 120px; margin-bottom: 15px;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Montgó Beach Volley Club</h1>
                      </td>
                    </tr>
      
                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 30px 40px 20px 40px;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0;">
                          ${t.hello}<strong>${name}</strong>${t.thankYouHereIsReceipt}
                        </p>
                      </td>
                    </tr>
      
                    <!-- Receipt -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px;">
                          <h2
                            style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                            ${t.bizumPaymentReceipt}
                          </h2>
      
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #374151; font-size: 14px;">${t.orderNumber}</strong>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span
                                  style="color: #1f2937; font-size: 14px; font-family: monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px;">${orderNumber}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <strong style="color: #374151; font-size: 14px;">${t.description}</strong>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                                <span style="color: #1f2937; font-size: 14px;">${description}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <strong style="color: #374151; font-size: 14px;">${t.amount}</strong>
                              </td>
                              <td style="padding: 12px 0; text-align: right;">
                                <span style="color: #059669; font-size: 18px; font-weight: bold;">${amount} €</span>
                              </td>
                            </tr>
                          </table>
      
                          <!-- Bizum Badge -->
                          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                            <div
                              style="background-color: #10b981; color: white; padding: 12px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                              <p>${t.paidWith}</p>
                              <img src="cid:bizumlogo@nodemailer" alt="Bizum"
                              style="height: 30px; width: auto; margin-left: 20px;">
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
      
                    <!-- Footer -->
                    <tr>
                      <td
                        style="background-color: #f9fafb; padding: 25px 40px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                          ${t.thankYouForTrustingUs}
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          ${t.anyQuestions}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
      
          </html>
        `
    });
  } catch (error) {
    console.error(error);
  }

}
