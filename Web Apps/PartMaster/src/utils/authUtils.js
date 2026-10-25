export const SESSION_USER_ID_KEY = 'sapinterface.userId';
export const SESSION_FORM_AUTH_KEY = 'sapinterface.formAuth';

export const unauthenticatedAuthInfo = {
  isAuthenticated: false,
  userId: null,
  name: null,
  firstName: null,
  lastName: null,
  email: null,
  roles: [],
  environment: null,
  status: null
};

export function resolveEmployeeId(identity) {
  if (typeof identity !== 'string') {
    return '';
  }

  const trimmedIdentity = identity.trim();
  if (!trimmedIdentity) {
    return '';
  }

  const slashSegments = trimmedIdentity.split('\\');
  const rightMostSegment = slashSegments[slashSegments.length - 1] || trimmedIdentity;
  const atIndex = rightMostSegment.indexOf('@');
  return atIndex > -1 ? rightMostSegment.slice(0, atIndex) : rightMostSegment;
}

function parseRoles(rolesValue) {
  if (Array.isArray(rolesValue)) {
    return rolesValue.map((role) => String(role).trim()).filter(Boolean);
  }

  if (typeof rolesValue === 'string') {
    return rolesValue.split(',').map((role) => role.trim()).filter(Boolean);
  }

  return [];
}

function isActiveStatus(status) {
  return typeof status === 'string' && status.trim().toLowerCase() === 'active';
}

export function normalizeLoginResponse(loginResponse) {
  if (!loginResponse || typeof loginResponse !== 'object') {
    return { ...unauthenticatedAuthInfo };
  }

  const userId = loginResponse.userId ?? loginResponse.UserId ?? null;
  const firstName = loginResponse.firstName ?? loginResponse.FirstName ?? '';
  const lastName = loginResponse.lastName ?? loginResponse.LastName ?? '';
  const email = loginResponse.email ?? loginResponse.Email ?? null;
  const status = loginResponse.status ?? loginResponse.Status ?? null;
  const roles = parseRoles(loginResponse.roles ?? loginResponse.Roles);
  const displayName = [firstName, lastName].filter(Boolean).join(' ');
  const isAuthenticated = Boolean(userId) && isActiveStatus(status);

  return {
    isAuthenticated,
    userId,
    name: displayName || userId,
    firstName: firstName || null,
    lastName: lastName || null,
    email,
    roles,
    environment: loginResponse.environment ?? loginResponse.Environment ?? null,
    status
  };
}

export function normalizeAuthInfo(data) {
  if (data?.userId || data?.UserId || data?.status || data?.Status) {
    return normalizeLoginResponse(data);
  }

  const resolvedUserId = data?.userId ?? data?.UserId ?? null;
  const resolvedName = data?.name
    ?? data?.userName
    ?? data?.user
    ?? resolvedUserId
    ?? data?.EmployeeId
    ?? null;
  const hasExplicitAuthFlag = typeof data?.isAuthenticated === 'boolean';
  const hasUserIdentity = Boolean(resolvedName);

  return {
    isAuthenticated: hasExplicitAuthFlag ? data.isAuthenticated : hasUserIdentity,
    userId: resolvedUserId,
    name: resolvedName,
    firstName: data?.firstName ?? data?.FirstName ?? null,
    lastName: data?.lastName ?? data?.LastName ?? null,
    email: data?.email ?? data?.Email ?? null,
    roles: parseRoles(data?.roles ?? data?.Roles),
    environment: data?.environment ?? data?.Environment ?? null,
    status: data?.status ?? data?.Status ?? null
  };
}

export function isValidLoginResponse(loginResponse) {
  return normalizeLoginResponse(loginResponse).isAuthenticated;
}

export function hasWorkOrderOperationCompleteRole(authInfo) {
  return (authInfo?.roles ?? []).some(
    (role) => role.toLowerCase() === 'workorderoperationcomplete'
  );
}

export function getStoredUserId() {
  return sessionStorage.getItem(SESSION_USER_ID_KEY) || '';
}

export function storeUserId(userId) {
  if (userId) {
    sessionStorage.setItem(SESSION_USER_ID_KEY, userId);
    return;
  }

  sessionStorage.removeItem(SESSION_USER_ID_KEY);
}

export function storeFormAuthInfo(authInfo) {
  if (authInfo?.isAuthenticated) {
    sessionStorage.setItem(SESSION_FORM_AUTH_KEY, JSON.stringify(authInfo));
    return;
  }

  sessionStorage.removeItem(SESSION_FORM_AUTH_KEY);
}

export function getStoredFormAuthInfo() {
  const storedValue = sessionStorage.getItem(SESSION_FORM_AUTH_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return parsedValue?.isAuthenticated ? parsedValue : null;
  } catch {
    sessionStorage.removeItem(SESSION_FORM_AUTH_KEY);
    return null;
  }
}

export function clearFormAuthInfo() {
  sessionStorage.removeItem(SESSION_FORM_AUTH_KEY);
}

export function getEffectiveAuthInfo(windowsAuthInfo, formAuthInfo = getStoredFormAuthInfo()) {
  if (formAuthInfo?.isAuthenticated) {
    return formAuthInfo;
  }

  return windowsAuthInfo;
}

export function getAuthenticatedUserId(authInfo) {
  return resolveEmployeeId(authInfo?.userId)
    || resolveEmployeeId(authInfo?.UserId)
    || resolveEmployeeId(authInfo?.name)
    || resolveEmployeeId(authInfo?.userName)
    || resolveEmployeeId(authInfo?.user)
    || resolveEmployeeId(authInfo?.EmployeeId)
    || getStoredUserId();
}

function parseYesNoValue(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE') {
    return true;
  }
  if (normalized === 'N' || normalized === 'NO' || normalized === 'FALSE') {
    return false;
  }

  return null;
}

function findYesNoField(value, fieldNames) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const parsedYesNoValue = parseYesNoValue(value);
    if (parsedYesNoValue !== null) {
      return parsedYesNoValue;
    }

    try {
      return findYesNoField(JSON.parse(value), fieldNames);
    } catch {
      return null;
    }
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findYesNoField(entry, fieldNames);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }

  if (typeof value === 'object') {
    for (const fieldName of fieldNames) {
      const directValue = parseYesNoValue(value[fieldName]);
      if (directValue !== null) {
        return directValue;
      }
    }

    for (const nestedValue of Object.values(value)) {
      const found = findYesNoField(nestedValue, fieldNames);
      if (found !== null) {
        return found;
      }
    }
  }

  return null;
}

export function isValidUserIdResponse(validationResponse) {
  return findYesNoField(validationResponse, [
    'ValidUserId',
    'validuserid',
    'IsValidUserId',
    'isvaliduserid',
    'UserValid',
    'uservalid'
  ]) === true;
}
