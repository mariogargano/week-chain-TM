/**
 * Helper functions for 2FA that don't require crypto
 * Safe to use in middleware and edge runtime
 */

/**
 * Verifica si un rol requiere 2FA
 */
export async function roleRequiresTwoFactor(role: string): Promise<boolean> {
  const rolesRequiring2FA = ["admin", "super_admin", "management", "notaria"]
  return rolesRequiring2FA.includes(role)
}
