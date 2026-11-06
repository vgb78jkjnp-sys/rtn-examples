import { useState } from 'react';
import { buildApiUrl } from './buildApiUrl';
import { parseApiError } from './parseApiError';

/**
 * Reusable hook to invoke an API endpoint with specified HTTP method and JSON body.
 * @param {string} method - HTTP method to use (e.g., 'POST', 'GET', 'PUT', 'DELETE')
 * @param {string} url - API endpoint URL
 * @param {object} requestOptions
 * @param {boolean} requestOptions.useWindowsAuth - When true, sends browser credentials for IIS Windows auth.
 * @returns {object} { data, error, loading, invoke }
 */
export function useInvokeApi(method, url, requestOptions = {}) {
  const { useWindowsAuth = true } = requestOptions;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const requestUrl = buildApiUrl(url);

  const getResultStatus = (result) => {
    if (!result || typeof result !== 'object') {
      return '';
    }

    return typeof result.Status === 'string'
      ? result.Status.trim().toLowerCase()
      : '';
  };

  const invoke = async (body) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const isGetRequest = method.toUpperCase() === 'GET';
      const fetchOptions = {
        method,
        credentials: 'include',
        headers: {}
      };

      if (useWindowsAuth) {
        fetchOptions.headers['X-Authentication-Mode'] = 'Windows';
      } else {
        fetchOptions.headers['X-Authentication-Mode'] = 'Form';
      }

      if (!isGetRequest) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(requestUrl, fetchOptions);
      if (!response.ok) {
        if (response.status === 401 && response.headers.get('WWW-Authenticate')) {
          throw new Error(
            'Authorization required by IIS. Enable Anonymous Authentication for /api/userservice/login and mark the login action [AllowAnonymous].'
          );
        }

        const apiError = await parseApiError(response);
        throw new Error(
          response.status === 401
            ? 'Unauthorized'
            : `API error (${response.status}): ${apiError}`
        );
      }

      const result = await response.json();
      if (getResultStatus(result) === 'error') {
        throw new Error(result.Message || 'API error');
      }
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, invoke };
}

export const invokeApi = useInvokeApi;

export default useInvokeApi;
