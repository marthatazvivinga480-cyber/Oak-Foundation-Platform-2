import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isConfigured } from '@/lib/supabase/config';
import { guard, fail } from '@/lib/api';
export async function POST(request: NextRequest) {
  try {
    guard(request);
    let authError = false;
    if (isConfigured()) {
      try {
        const client = await createClient();
        const { error } = await client.auth.signOut();
        authError = Boolean(error);
      } catch {
        authError = true;
      }
    }
    const response = NextResponse.json(
      authError ? { error: 'Staff sign-out failed. Please try again.' } : { ok: true },
      { status: authError ? 503 : 200 },
    );
    response.cookies.set('oak-session', '', {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax', path: '/', maxAge: 0,
    });
    return response;
  } catch (e) {
    return fail(e);
  }
}
