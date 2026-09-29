import 'server-only';
import { redirect } from 'next/navigation';
import { myRegistration, staffUser } from './repository';
import { isConfigured } from './supabase/config';
import { coordinatorAccess } from './coordinator-access';
export async function canCoordinate() {
  const configured = isConfigured();
  return coordinatorAccess(configured, configured ? Boolean(await staffUser()) : false,
    configured ? null : (await myRegistration())?.role ?? null);
}
export async function currentRole() {
  if (await staffUser()) return 'Coordination Team';
  return (await myRegistration())?.role ?? null;
}
export async function requirePage(roles: string[]) {
  if (roles.length === 1 && roles[0] === 'Coordination Team') {
    if (!(await canCoordinate())) redirect('/staff');
    return;
  }
  const role = await currentRole();
  if (!role) redirect('/');
  if (!roles.includes(role)) redirect(role === 'Partner' ? '/qr-code' : '/programme');
}
export const programmeRoles = ['OAK Staff', 'Coordination Team', 'Presenter', 'Observer'];
