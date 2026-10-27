export { authConfig, default } from './auth.config';

export { unauthenticatedAuthInfo } from './core/constants';
export { hasAppAccess, hasRequiredRoles } from './core/access';
export { createAuthStorage } from './core/storage';
export {
  normalizeAuthStatusResponse,
  normalizeLoginResponse,
  isValidLoginResponse
} from './core/normalize';
export {
  resolveEmployeeId,
  getAuthenticatedUserId,
  getEffectiveAuthInfo,
  getAccessAuthInfo
} from './core/userId';
export { isValidUserIdResponse } from './core/validateUserId';

export { AuthProvider } from './react/AuthProvider';
export { useAuth } from './react/useAuth';
export { default as AuthGate } from './react/AuthGate';
export { default as Login } from './ui/Login';
