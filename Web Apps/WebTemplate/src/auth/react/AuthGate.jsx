import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageLoadingOverlay from '../../components/PageLoadingOverlay';
import { hasAppAccess } from '../core/access';
import { getAccessAuthInfo, getAuthenticatedUserId } from '../core/userId';
import Login from '../ui/Login';
import { useAuth } from './useAuth';

function AuthGate({ children }) {
  const {
    config,
    storage,
    authInfo,
    windowsAuthInfo,
    formAuthInfo,
    authSource,
    loading,
    forceLoginPrompt,
    applyFormLogin
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [accessState, setAccessState] = useState('checking');
  const [permissionError, setPermissionError] = useState('');
  const hasAuthorizedRef = useRef(false);
  const accessCheckKeyRef = useRef('');

  const accessDeniedMessage = config.messages.accessDenied;
  const defaultRoute = config.defaultRoute ?? '/';

  useEffect(() => {
    if (loading) {
      return;
    }

    if (forceLoginPrompt) {
      hasAuthorizedRef.current = false;
      accessCheckKeyRef.current = '';
      setAccessState('login');
      return;
    }

    if (!authInfo.isAuthenticated) {
      hasAuthorizedRef.current = false;
      accessCheckKeyRef.current = '';
      setAccessState('login');
    }
  }, [authInfo.isAuthenticated, forceLoginPrompt, loading]);

  useEffect(() => {
    if (loading || hasAuthorizedRef.current || forceLoginPrompt) {
      return undefined;
    }

    const accessAuthInfo = getAccessAuthInfo(authSource, windowsAuthInfo, formAuthInfo);
    const userId = getAuthenticatedUserId(accessAuthInfo, storage.getStoredUserId);
    const checkKey = [
      authSource ?? '',
      userId,
      accessAuthInfo.isAuthenticated ? '1' : '0',
      (accessAuthInfo.roles ?? []).join('|')
    ].join('::');

    if (accessCheckKeyRef.current === checkKey) {
      return undefined;
    }

    let cancelled = false;

    const checkAccess = () => {
      accessCheckKeyRef.current = checkKey;
      setAccessState('checking');
      setPermissionError('');

      if (!accessAuthInfo.isAuthenticated) {
        if (!cancelled) {
          setAccessState('login');
        }
        return;
      }

      const allowed = hasAppAccess(accessAuthInfo, config);
      if (cancelled) {
        return;
      }

      accessCheckKeyRef.current = checkKey;

      if (allowed) {
        storage.storeUserId(userId);
        hasAuthorizedRef.current = true;
        setAccessState('authorized');
        return;
      }

      setPermissionError(accessDeniedMessage);
      setAccessState('login');
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [authSource, config, forceLoginPrompt, formAuthInfo, loading, storage, windowsAuthInfo]);

  const handleLoginSuccess = async (userId, loginAuthInfo) => {
    setPermissionError('');
    applyFormLogin(loginAuthInfo);
    accessCheckKeyRef.current = '';

    const resolvedUserId = getAuthenticatedUserId(loginAuthInfo, storage.getStoredUserId) || userId;

    if (hasAppAccess(loginAuthInfo, config)) {
      storage.storeUserId(resolvedUserId);
      hasAuthorizedRef.current = true;
      setAccessState('authorized');
      navigate(defaultRoute, { replace: true });
      return;
    }

    setPermissionError(accessDeniedMessage);
    setAccessState('login');
  };

  if (loading || accessState === 'checking') {
    return (
      <PageLoadingOverlay visible message={config.messages.checkingAuth} />
    );
  }

  if (accessState === 'login') {
    return (
      <Login
        config={config}
        storage={storage}
        initialUserId={
          getAuthenticatedUserId(windowsAuthInfo, storage.getStoredUserId)
          || getAuthenticatedUserId(authInfo, storage.getStoredUserId)
        }
        onLoginSuccess={handleLoginSuccess}
        permissionError={permissionError}
        windowsAuthFailed={!windowsAuthInfo.isAuthenticated}
      />
    );
  }

  if (
    accessState === 'authorized'
    && defaultRoute !== '/'
    && location.pathname === '/'
  ) {
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}

export default AuthGate;
