export function extractText(cheerioDoc) {
  const body = cheerioDoc('body').text() || '';
  return body.replace(/\s+/g, ' ').trim();
}

export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
