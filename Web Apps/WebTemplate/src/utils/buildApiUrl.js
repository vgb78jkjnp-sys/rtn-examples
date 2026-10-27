const localApiOrigin = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5291').replace(/\/$/, '');

export function buildApiUrl(path) {
  if (!path) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiOrigin = import.meta.env.DEV ? localApiOrigin : '';

  return `${apiOrigin}${normalizedPath}`;
}

export default buildApiUrl;
