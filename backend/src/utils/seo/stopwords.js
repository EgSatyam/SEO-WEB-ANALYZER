export const stopwords = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'it', 'its',
]);

export function isStopword(word) {
  return stopwords.has(String(word).toLowerCase());
}

export function getTopKeywords(text, limit = 20) {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const freq = {};
  for (const w of words) {
    if (w.length < 2 || isStopword(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function getKeywordDensity(text, topN = 3) {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const total = words.length;
  if (total < 1) return [];
  const freq = {};
  for (const w of words) {
    if (w.length < 2 || isStopword(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ keyword: word, density: Math.round((count / total) * 10000) / 100 }));
}

export function getPrimaryKeyword(text) {
  const top = getTopKeywords(text, 1);
  return top[0] || null;
}
