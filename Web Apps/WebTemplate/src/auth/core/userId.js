export function resolveEmployeeId(identity) {
  if (typeof identity !== 'string') {
    return '';
  }

  const trimmedIdentity = identity.trim();
  if (!trimmedIdentity) {
    return '';
  }

  return trimmedIdentity;
}

export function getAuthenticatedUserId(authInfo, getStoredUserId) {
  return resolveEmployeeId(authInfo?.userId)
    || resolveEmployeeId(authInfo?.UserId)
    || resolveEmployeeId(authInfo?.name)
    || resolveEmployeeId(authInfo?.userName)
    || resolveEmployeeId(authInfo?.user)
    || resolveEmployeeId(authInfo?.EmployeeId)
    || getStoredUserId();
}

export function getEffectiveAuthInfo(windowsAuthInfo, formAuthInfo) {
  if (formAuthInfo?.isAuthenticated) {
    return formAuthInfo;
  }

  return windowsAuthInfo;
}

export function getAccessAuthInfo(authSource, windowsAuthInfo, formAuthInfo) {
  const effectiveAuth = getEffectiveAuthInfo(windowsAuthInfo, formAuthInfo);
  return authSource === 'form' ? effectiveAuth : windowsAuthInfo;
}
