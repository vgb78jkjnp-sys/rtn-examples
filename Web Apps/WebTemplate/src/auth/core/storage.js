export function createAuthStorage(storageKeys) {
  const userIdKey = storageKeys.userId;
  const formAuthKey = storageKeys.formAuth;

  return {
    getStoredUserId() {
      return sessionStorage.getItem(userIdKey) || '';
    },

    storeUserId(userId) {
      if (userId) {
        sessionStorage.setItem(userIdKey, userId);
        return;
      }

      sessionStorage.removeItem(userIdKey);
    },

    storeFormAuthInfo(authInfo) {
      if (authInfo?.isAuthenticated) {
        sessionStorage.setItem(formAuthKey, JSON.stringify(authInfo));
        return;
      }

      sessionStorage.removeItem(formAuthKey);
    },

    getStoredFormAuthInfo() {
      const storedValue = sessionStorage.getItem(formAuthKey);
      if (!storedValue) {
        return null;
      }

      try {
        const parsedValue = JSON.parse(storedValue);
        return parsedValue?.isAuthenticated ? parsedValue : null;
      } catch {
        sessionStorage.removeItem(formAuthKey);
        return null;
      }
    },

    clearFormAuthInfo() {
      sessionStorage.removeItem(formAuthKey);
    }
  };
}
