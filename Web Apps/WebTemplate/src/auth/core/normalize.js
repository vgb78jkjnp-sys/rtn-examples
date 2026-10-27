import { mergeDataArrayEntries } from '../../utils/parseApiResponse';
import { unauthenticatedAuthInfo } from './constants';

function parseRoleEntry(role) {
  if (role && typeof role === 'object') {
    const roleName = role.name ?? role.Name ?? role.role ?? role.Role ?? role.roleName ?? role.RoleName;
    return typeof roleName === 'string' ? roleName.trim() : '';
  }

  return String(role).trim();
}

function parseRoles(rolesValue) {
  if (Array.isArray(rolesValue)) {
    return rolesValue.map(parseRoleEntry).filter(Boolean);
  }

  if (typeof rolesValue === 'string') {
    return rolesValue.split(',').map((role) => role.trim()).filter(Boolean);
  }

  return [];
}

function unwrapAuthStatusPayload(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data.Data)) {
    const merged = mergeDataArrayEntries(data.Data);
    if (Object.keys(merged).length > 0) {
      return { ...data, ...merged };
    }
  }

  if (Array.isArray(data.data)) {
    const merged = mergeDataArrayEntries(data.data);
    if (Object.keys(merged).length > 0) {
      return { ...data, ...merged };
    }
  }

  return data;
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
  const displayName = userId;
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

export function normalizeAuthStatusResponse(data) {
  const payload = unwrapAuthStatusPayload(data);
  if (!payload || typeof payload !== 'object') {
    return { ...unauthenticatedAuthInfo };
  }

  const loginShaped = normalizeLoginResponse(payload);
  if (loginShaped.isAuthenticated) {
    return loginShaped;
  }

  const roles = loginShaped.roles.length > 0
    ? loginShaped.roles
    : parseRoles(payload.roles ?? payload.Roles);
  const userId = payload.userId ?? payload.UserId ?? loginShaped.userId ?? null;
  const resolvedName = payload.name
    ?? payload.userName
    ?? payload.user
    ?? userId
    ?? payload.EmployeeId
    ?? loginShaped.name
    ?? null;
  const hasIdentity = Boolean(
    (typeof userId === 'string' && userId.trim())
    || (typeof resolvedName === 'string' && resolvedName.trim())
  );
  const explicitAuth = payload.isAuthenticated ?? payload.IsAuthenticated;
  const isAuthenticated = typeof explicitAuth === 'boolean'
    ? explicitAuth && hasIdentity
    : hasIdentity;

  return {
    isAuthenticated,
    userId: userId ?? (typeof resolvedName === 'string' ? resolvedName : null),
    name: resolvedName,
    firstName: payload.firstName ?? payload.FirstName ?? loginShaped.firstName,
    lastName: payload.lastName ?? payload.LastName ?? loginShaped.lastName,
    email: payload.email ?? payload.Email ?? loginShaped.email,
    roles,
    environment: payload.environment ?? payload.Environment ?? loginShaped.environment,
    status: payload.status ?? payload.Status ?? loginShaped.status
  };
}

export function isValidLoginResponse(loginResponse) {
  return normalizeLoginResponse(loginResponse).isAuthenticated;
}
