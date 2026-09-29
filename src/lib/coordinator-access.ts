export function coordinatorAccess(configured: boolean, approvedStaff: boolean, role: string | null) {
  return configured ? approvedStaff : role === 'Coordination Team';
}
