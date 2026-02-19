const WEIGHTS = {
  title: 10,
  titleLength: 5,
  meta: 10,
  metaLength: 5,
  h1: 10,
  headings: 5,
  wordCount: 10,
  readability: 5,
  imagesAlt: 5,
  links: 5,
  keywordInTitle: 5,
  keywordInMeta: 5,
};

function segmentScore(ok, partial = false) {
  if (ok) return 100;
  return partial ? 50 : 0;
}

export function calculateScore(metrics) {
  let total = 0;
  let max = 0;
  const breakdown = {};
  const suggestions = [];

  const add = (key, weight, value, partial) => {
    max += weight;
    const seg = segmentScore(value, partial);
    total += weight * (seg / 100);
    breakdown[key] = seg;
    if (!value && key !== 'partial') {
      if (metrics.suggestions?.length) suggestions.push(...metrics.suggestions.filter((s) => s.key === key));
    }
  };

  add('title', WEIGHTS.title, !!metrics.title);
  add('titleLength', WEIGHTS.titleLength, metrics.titleLengthOk, metrics.titleLengthPartial);
  add('meta', WEIGHTS.meta, !!metrics.metaDescription);
  add('metaLength', WEIGHTS.metaLength, metrics.metaLengthOk, metrics.metaLengthPartial);
  add('h1', WEIGHTS.h1, metrics.h1Count === 1);
  add('headings', WEIGHTS.headings, (metrics.h2Count ?? 0) >= 0);
  add('wordCount', WEIGHTS.wordCount, !metrics.thinContent);
  add('readability', WEIGHTS.readability, (metrics.readabilityScore ?? 0) >= 30);
  add('imagesAlt', WEIGHTS.imagesAlt, (metrics.images?.altCoverage ?? 100) >= 80);
  add('links', WEIGHTS.links, (metrics.brokenCount ?? 0) === 0);
  add('keywordInTitle', WEIGHTS.keywordInTitle, metrics.primaryKeywordInTitle ? 1 : 0);
  add('keywordInMeta', WEIGHTS.keywordInMeta, metrics.primaryKeywordInMeta ? 1 : 0);

  const score = max > 0 ? Math.round((total / max) * 100) : 0;
  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown,
    suggestions: metrics.suggestions || suggestions,
  };
}
