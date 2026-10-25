export function formatLikeMask(value) {
  const trimmed = (value ?? '').trim().replace(/\*/g, '%');
  if (!trimmed) {
    return '%';
  }

  if (trimmed.includes('%') || trimmed.includes('_')) {
    return trimmed;
  }

  return `${trimmed}%`;
}

export function getDefaultPartIdMask() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}%`;
}

export function parseMaxRows(value, fallback = 1000) {
  const trimmed = (value ?? '').toString().trim();
  if (!trimmed) {
    return fallback;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}
