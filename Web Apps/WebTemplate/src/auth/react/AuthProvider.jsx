import { useEffect, useMemo, useState } from 'react';
import { authConfig as defaultAuthConfig } from '../auth.config';
import { useAuthServiceApi } from '../api/useAuthServiceApi';
import { unauthenticatedAuthInfo } from '../core/constants';
import { normalizeAuthStatusResponse } from '../core/normalize';
import { createAuthStorage } from '../core/storage';
import { AuthContext } from './authContext';

export function AuthProvider({ children, config = defaultAuthConfig }) {
  const storage = useMemo(() => createAuthStorage(config.storageKeys), [config.storageKeys]);
  const storedFormOnMount = storage.getStoredFormAuthInfo();

  const [windowsAuthInfo, setWindowsAuthInfo] = useState(unauthenticatedAuthInfo);
  const [formAuthInfo, setFormAuthInfo] = useState(() => storedFormOnMount ?? unauthenticatedAuthInfo);
  const [authSource, setAuthSource] = useState(() => (storedFormOnMount?.isAuthenticated ? 'form' : null));
  const [forceLoginPrompt, setForceLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  const { invokeAuthStatus } = useAuthServiceApi(config.api);

  const authInfo = authSource === 'form' && formAuthInfo.isAuthenticated
    ? formAuthInfo
    : windowsAuthInfo;

  const fetchWindowsAuthStatus = async () => {
    const data = await invokeAuthStatus();
    return normalizeAuthStatusResponse(data);
  };

  const applyFormLogin = (loginAuthInfo) => {
    storage.storeFormAuthInfo(loginAuthInfo);
    setFormAuthInfo(loginAuthInfo);
    setAuthSource('form');
    setForceLoginPrompt(false);
  };

  const logout = async () => {
    storage.clearFormAuthInfo();
    storage.storeUserId('');
    setFormAuthInfo(unauthenticatedAuthInfo);
    setAuthSource(null);
    setForceLoginPrompt(true);

    try {
      const nextWindowsAuthInfo = await fetchWindowsAuthStatus();
      setWindowsAuthInfo(nextWindowsAuthInfo);
    } catch {
      setWindowsAuthInfo(unauthenticatedAuthInfo);
    }
  };

  const resolveAuthSourceAfterWindowsFetch = (nextWindowsAuthInfo) => {
    const storedFormAuth = storage.getStoredFormAuthInfo();
    if (storedFormAuth?.isAuthenticated) {
      setFormAuthInfo(storedFormAuth);
      setAuthSource('form');
      return;
    }

    setAuthSource(nextWindowsAuthInfo.isAuthenticated ? 'windows' : null);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const nextWindowsAuthInfo = await fetchWindowsAuthStatus();

        if (!isMounted) {
          return;
        }

        setWindowsAuthInfo(nextWindowsAuthInfo);
        resolveAuthSourceAfterWindowsFetch(nextWindowsAuthInfo);
      } catch {
        if (!isMounted) {
          return;
        }

        setWindowsAuthInfo(unauthenticatedAuthInfo);
        resolveAuthSourceAfterWindowsFetch(unauthenticatedAuthInfo);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({
    config,
    storage,
    authInfo,
    authSource,
    windowsAuthInfo,
    formAuthInfo,
    loading,
    forceLoginPrompt,
    applyFormLogin,
    logout
  }), [
    config,
    storage,
    authInfo,
    authSource,
    windowsAuthInfo,
    formAuthInfo,
    loading,
    forceLoginPrompt
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
