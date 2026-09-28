import { NextRequest, NextResponse } from 'next/server';
import { registrationSchema } from '@/lib/validation';
import { register, recordEmailStatus } from '@/lib/repository';
import { guard, fail } from '@/lib/api';
import { sendConfirmation } from '@/lib/confirmation-email';
export async function POST(request: NextRequest) {
  try {
    guard(request);
    if (Number(request.headers.get('content-length') ?? 0) > 16000)
      return fail(new Error('Form is too large.'), 413);
    const body = await request.json();
    if (body.website) return fail(new Error('Unable to submit form.'));
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) return fail(new Error(parsed.error.issues[0].message));
    const registration = await register(parsed.data);
    const emailStatus = await sendConfirmation(registration);
    await recordEmailStatus(registration, emailStatus);
    const response = NextResponse.json(
      { registration: { ...registration, sessionToken: undefined } },
      { status: 201 },
    );
    response.cookies.set('oak-session', registration.sessionToken!, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (e) {
    return fail(e);
  }
}
