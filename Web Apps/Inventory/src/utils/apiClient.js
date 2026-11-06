import { buildApiUrl } from './buildApiUrl';
import { parseApiError } from './parseApiError';

function getResultStatus(result) {
  if (!result || typeof result !== 'object') {
    return '';
  }

  return typeof result.Status === 'string'
    ? result.Status.trim().toLowerCase()
    : '';
}

export async function postApi(path, body, { useWindowsAuth = true } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Authentication-Mode': useWindowsAuth ? 'Windows' : 'Form'
    },
    credentials: 'include',
    body: JSON.stringify(body)
  });

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

  return result;
}

export function validateUserIdRequest(userId) {
  return postApi('/api/userservice/VALIDATEUSERID', { UserId: userId });
}
