export async function parseApiError(response) {
  const text = await response.text();

  if (!text) {
    return response.statusText || `HTTP ${response.status}`;
  }

  const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  if (text.includes('<html') || text.includes('<!DOCTYPE')) {
    return `HTTP ${response.status} — endpoint not found (is MrsiService deployed at /api/mrsiservice?)`;
  }

  try {
    const result = JSON.parse(text);
    const message = result.Message || result.message || result.title || result.error;

    if (message) {
      return typeof message === 'string' ? message : JSON.stringify(message);
    }

    return text;
  } catch {
    return text.length > 200 ? `${text.slice(0, 200)}...` : text;
  }
}

export default parseApiError;
