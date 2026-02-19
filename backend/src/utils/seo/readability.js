import { countWords } from './text.js';

export function calculateReadabilityScore(text) {
  const words = countWords(text);
  if (words < 1) return 0;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const syllables = estimateSyllables(text);
  const asl = words / sentences;
  const asw = syllables / words;
  const score = 206.835 - 1.015 * asl - 84.6 * asw;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function estimateSyllables(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const w of words) {
    const matches = w.match(/[aeiouy]+/g);
    count += matches ? matches.length : 1;
  }
  return count;
}
