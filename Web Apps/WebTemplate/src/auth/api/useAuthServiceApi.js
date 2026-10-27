import useInvokeApi from '../../utils/invokeApi';

export function useAuthServiceApi(apiConfig) {
  const { invoke: invokeAuthStatus } = useInvokeApi('GET', apiConfig.authStatusPath, {
    useWindowsAuth: true
  });
  const { invoke: invokeLogin } = useInvokeApi('POST', apiConfig.loginPath, {
    useWindowsAuth: false
  });

  return {
    invokeAuthStatus,
    invokeLogin
  };
}
