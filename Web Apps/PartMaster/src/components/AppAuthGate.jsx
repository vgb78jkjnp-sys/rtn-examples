import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { validateUserIdRequest } from '../utils/apiClient';
import {
  getAuthenticatedUserId,
  getEffectiveAuthInfo,
  hasWorkOrderOperationCompleteRole,
  isValidUserIdResponse,
  storeUserId
} from '../utils/authUtils';
import Login from './Login';

const permissionDeniedMessage = 'Your Windows account does not have access. Sign in with an authorized user id and password.';

async function hasAppAccess(authInfo, userId) {
  if (hasWorkOrderOperationCompleteRole(authInfo)) {
    return true;
  }

  if (!userId) {
    return false;
  }

  const validationResponse = await validateUserIdRequest(userId);
  return isValidUserIdResponse(validationResponse);
}

function AppAuthGate({ children }) {
  const {
    windowsAuthInfo,
    formAuthInfo,
    authSource,
    loading,
    applyFormLogin
  } = useAuth();
  const [accessState, setAccessState] = useState('checking');
  const [permissionError, setPermissionError] = useState('');
  const hasAuthorizedRef = useRef(false);
  const accessCheckKeyRef = useRef('');

  useEffect(() => {
    if (loading || hasAuthorizedRef.current) {
      return undefined;
    }

    const effectiveAuth = getEffectiveAuthInfo(windowsAuthInfo, formAuthInfo);
    const userId = getAuthenticatedUserId(effectiveAuth);
    const checkKey = [
      authSource ?? '',
      userId,
      effectiveAuth.isAuthenticated ? '1' : '0',
      (effectiveAuth.roles ?? []).join('|')
    ].join('::');

    if (accessCheckKeyRef.current === checkKey) {
      return undefined;
    }

    let cancelled = false;

    const checkAccess = async () => {
      accessCheckKeyRef.current = checkKey;
      setAccessState('checking');
      setPermissionError('');

      if (!effectiveAuth.isAuthenticated) {
        accessCheckKeyRef.current = checkKey;
        if (!cancelled) {
          setAccessState('login');
        }
        return;
      }

      try {
        const hasAccess = await hasAppAccess(effectiveAuth, userId);
        if (cancelled) {
          return;
        }

        accessCheckKeyRef.current = checkKey;

        if (hasAccess) {
          storeUserId(userId);
          hasAuthorizedRef.current = true;
          setAccessState('authorized');
          return;
        }

        if (authSource === 'windows' || windowsAuthInfo.isAuthenticated) {
          setPermissionError(permissionDeniedMessage);
        } else {
          setPermissionError('Access denied. Please email your RTN administrator to request access.');
        }
        setAccessState('login');
      } catch (err) {
        accessCheckKeyRef.current = checkKey;
        if (!cancelled) {
          setPermissionError(err?.message || 'Unable to validate user access. Please try again.');
          setAccessState('login');
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [authSource, formAuthInfo, loading, windowsAuthInfo]);

  const handleLoginSuccess = async (userId, loginAuthInfo) => {
    setPermissionError('');
    applyFormLogin(loginAuthInfo);
    accessCheckKeyRef.current = '';

    const resolvedUserId = getAuthenticatedUserId(loginAuthInfo) || userId;

    try {
      const hasAccess = await hasAppAccess(loginAuthInfo, resolvedUserId);
      if (hasAccess) {
        storeUserId(resolvedUserId);
        hasAuthorizedRef.current = true;
        setAccessState('authorized');
        return;
      }

      setPermissionError('Access denied. Please email your RTN administrator to request access.');
      setAccessState('login');
    } catch (err) {
      setPermissionError(err?.message || 'Unable to validate user access. Please try again.');
      setAccessState('login');
    }
  };

  if (loading || accessState === 'checking') {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0">Checking Windows authentication...</p>
        </div>
      </div>
    );
  }

  if (accessState === 'login') {
    return (
      <Login
        initialUserId={getAuthenticatedUserId(windowsAuthInfo) || getAuthenticatedUserId(formAuthInfo)}
        onLoginSuccess={handleLoginSuccess}
        permissionError={permissionError}
        windowsAuthFailed={!windowsAuthInfo.isAuthenticated}
      />
    );
  }

  return children;
}

export default AppAuthGate;
