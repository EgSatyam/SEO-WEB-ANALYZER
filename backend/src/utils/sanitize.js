export function sanitizeUrl(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, '');
}

export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ').slice(0, 10000);
}
