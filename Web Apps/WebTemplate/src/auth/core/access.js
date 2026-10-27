/**
 * @param {'any' | 'all'} roleMatch - require any listed role (default) or all of them
 */
export function hasRequiredRoles(authInfo, requiredRoles, roleMatch = 'any') {
  const userRoles = (authInfo?.roles ?? []).map((role) => role.toLowerCase());
  const required = (requiredRoles ?? []).map((role) => String(role).toLowerCase());

  if (required.length === 0) {
    return true;
  }

  if (roleMatch === 'all') {
    return required.every((role) => userRoles.includes(role));
  }

  return required.some((role) => userRoles.includes(role));
}

export function hasAppAccess(authInfo, authConfig) {
  return hasRequiredRoles(authInfo, authConfig.requiredRoles, authConfig.roleMatch ?? 'any');
}
