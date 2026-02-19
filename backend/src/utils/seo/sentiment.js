export function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, label: 'neutral' };
  }
  const positive = /\b(good|great|best|love|excellent|amazing|happy|success)\b/gi;
  const negative = /\b(bad|worst|hate|poor|terrible|awful|sad|fail)\b/gi;
  const pos = (text.match(positive) || []).length;
  const neg = (text.match(negative) || []).length;
  const score = Math.max(-1, Math.min(1, (pos - neg) / 10));
  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  return { score, label };
}
