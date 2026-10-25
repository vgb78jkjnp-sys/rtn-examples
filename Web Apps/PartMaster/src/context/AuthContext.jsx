import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import { invokeUserAuthStatusApi as useInvokeUserAuthStatusApi } from '../utils/apiInstances';
import {
  clearFormAuthInfo,
  getStoredFormAuthInfo,
  normalizeAuthInfo,
  storeFormAuthInfo,
  unauthenticatedAuthInfo
} from '../utils/authUtils';

export function AuthProvider({ children }) {
  const [windowsAuthInfo, setWindowsAuthInfo] = useState(unauthenticatedAuthInfo);
  const [formAuthInfo, setFormAuthInfo] = useState(() => getStoredFormAuthInfo() ?? unauthenticatedAuthInfo);
  const [authSource, setAuthSource] = useState(() => (getStoredFormAuthInfo()?.isAuthenticated ? 'form' : null));
  const [loading, setLoading] = useState(true);
  const { invoke: invokeUserAuthStatus } = useInvokeUserAuthStatusApi();

  const authInfo = authSource === 'form' && formAuthInfo.isAuthenticated
    ? formAuthInfo
    : windowsAuthInfo;

  const fetchWindowsAuthStatus = async () => {
    const data = await invokeUserAuthStatus();
    return normalizeAuthInfo(data);
  };

  const applyFormLogin = (loginAuthInfo) => {
    storeFormAuthInfo(loginAuthInfo);
    setFormAuthInfo(loginAuthInfo);
    setAuthSource('form');
  };

  const refreshAuth = async ({ showLoading = true, preferWindows = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const nextWindowsAuthInfo = await fetchWindowsAuthStatus();
      setWindowsAuthInfo(nextWindowsAuthInfo);

      if (preferWindows) {
        setAuthSource(nextWindowsAuthInfo.isAuthenticated ? 'windows' : null);
        if (!nextWindowsAuthInfo.isAuthenticated) {
          clearFormAuthInfo();
          setFormAuthInfo(unauthenticatedAuthInfo);
        }
        return nextWindowsAuthInfo;
      }

      if (authSource === 'form' && formAuthInfo.isAuthenticated) {
        return formAuthInfo;
      }

      if (nextWindowsAuthInfo.isAuthenticated) {
        setAuthSource('windows');
        return nextWindowsAuthInfo;
      }

      const storedFormAuth = getStoredFormAuthInfo();
      if (storedFormAuth?.isAuthenticated) {
        setFormAuthInfo(storedFormAuth);
        setAuthSource('form');
        return storedFormAuth;
      }

      setAuthSource(null);
      return unauthenticatedAuthInfo;
    } catch {
      if (authSource === 'form' && formAuthInfo.isAuthenticated) {
        return formAuthInfo;
      }

      setWindowsAuthInfo(unauthenticatedAuthInfo);
      setAuthSource(null);
      return unauthenticatedAuthInfo;
    } finally {
      setLoading(false);
    }
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

        const storedFormAuth = getStoredFormAuthInfo();
        if (storedFormAuth?.isAuthenticated) {
          setFormAuthInfo(storedFormAuth);
          setAuthSource('form');
          return;
        }

        setAuthSource(nextWindowsAuthInfo.isAuthenticated ? 'windows' : null);
      } catch {
        if (!isMounted) {
          return;
        }

        setWindowsAuthInfo(unauthenticatedAuthInfo);

        const storedFormAuth = getStoredFormAuthInfo();
        if (storedFormAuth?.isAuthenticated) {
          setFormAuthInfo(storedFormAuth);
          setAuthSource('form');
          return;
        }

        setAuthSource(null);
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
    // Bootstrap Windows/form auth once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{
      authInfo,
      authSource,
      windowsAuthInfo,
      formAuthInfo,
      loading,
      refreshAuth,
      applyFormLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}
