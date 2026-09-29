import { NextRequest, NextResponse } from 'next/server';
import { isConfigured } from './supabase/config';
import { staffUser } from './repository';
import { canCoordinate } from './access';
export function fail(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' },
    { status },
  );
}
export function guard(request: NextRequest) {
  if (!isConfigured() && !['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname))
    throw new Error('Connect Supabase before using this app on a public host.');
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host'))
    throw new Error('Request origin is not allowed.');
}
export async function requireStaff() {
  if (!(await canCoordinate()))
    throw new Error('An approved Coordination Team sign-in is required.');
}
