export function analyzeImages(cheerioDoc) {
  const images = [];
  cheerioDoc('img').each((_, el) => {
    const src = cheerioDoc(el).attr('src');
    const alt = cheerioDoc(el).attr('alt');
    if (src) images.push({ src, hasAlt: !!alt?.trim() });
  });
  const total = images.length;
  const withAlt = images.filter((i) => i.hasAlt).length;
  const altCoverage = total > 0 ? Math.round((withAlt / total) * 100) : 100;
  return {
    total,
    withAlt,
    altCoverage,
    suggestion: total > 0 && altCoverage < 80 ? 'Add alt text to missing images' : null,
  };
}
