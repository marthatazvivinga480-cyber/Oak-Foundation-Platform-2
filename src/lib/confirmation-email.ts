import 'server-only';
import QRCode from 'qrcode';
import type { Registration } from './types';
import { event } from './data';

export async function sendConfirmation(entry: Registration) {
  console.log('SEND CONFIRMATION CALLED');
  console.log('Email:', entry.email);
  console.log('Role:', entry.role);

  if (entry.role !== 'Partner') {
    console.log('EMAIL SKIPPED because role is:', entry.role);
    return 'not-applicable';
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error('EMAIL CONFIGURATION MISSING');
    return 'not-configured';
  }

  console.log('Attempting to contact Resend...');

  try {
    const png = await QRCode.toBuffer(entry.code, {
      width: 600,
      margin: 4,
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `registration-${entry.id}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [entry.email],
        subject: 'Your OAK Foundation event registration',

        text: `You are registered, ${entry.firstName} ${entry.lastName}.

Organisation: ${entry.organisation}
Registration ID: ${entry.id}
Role: ${entry.role}
Event: ${event.name}
Dates: ${event.dates}
Location: ${event.location}

Your downloadable entry QR code is attached. Present it at event check-in.`,

        attachments: [
          {
            filename: 'OAK-entry-pass.png',
            content: png.toString('base64'),
          },
        ],
      }),
    });

    const responseBody = await response.text();

    console.log('Resend status:', response.status);
    console.log('Resend response:', responseBody);

    if (!response.ok) {
      console.error('Resend request failed');
      return 'failed';
    }

    console.log('Confirmation email sent successfully');

    return 'sent';
  } catch (error) {
    console.error('Confirmation email error:', error);
    return 'failed';
  }
}