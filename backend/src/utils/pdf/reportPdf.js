import PDFDocument from 'pdfkit';

export async function generateReportPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('SEO Report', { align: 'center' });
    doc.moveDown(0.5);
    if (report.score != null) {
      doc.fontSize(14).text(`Score: ${report.score}/100`, { align: 'center' });
      doc.moveDown(0.5);
    }
    doc.fontSize(12);
    doc.text(`Type: ${report.type || 'URL'}`);
    doc.text(`Input: ${report.input || report.url || 'N/A'}`);
    doc.moveDown();
    doc.text(`Title: ${report.title || 'N/A'}`);
    doc.text(`Meta description: ${report.metaDescription || 'N/A' || ''}`);
    doc.moveDown();
    doc.text(`Word count: ${report.wordCount ?? 0}`);
    doc.text(`Readability score: ${report.readabilityScore ?? 0}`);
    doc.text(`Sentiment: ${report.sentiment?.label ?? 'N/A'}`);
    if (report.primaryKeyword) doc.text(`Primary keyword: ${report.primaryKeyword}`);
    if (report.keywords?.length) {
      doc.moveDown(0.5);
      doc.text('Top keywords: ' + report.keywords.slice(0, 10).join(', '));
    }
    if (report.keywordDensity?.length) {
      doc.text('Keyword density: ' + report.keywordDensity.map((k) => `${k.keyword} ${k.density}%`).join(', '));
    }
    if (report.images?.total != null) {
      doc.moveDown(0.5);
      doc.text(`Images: ${report.images.withAlt ?? 0}/${report.images.total} with alt (${report.images.altCoverage ?? 0}% coverage)`);
    }
    if (report.linkStats?.total != null) {
      doc.text(`Links: ${report.linkStats.internal ?? 0} internal, ${report.linkStats.external ?? 0} external`);
      if (report.brokenCount > 0) doc.text(`Broken links: ${report.brokenCount}`);
    }
    if (report.duplicateTitle) doc.text('Warning: Duplicate title in your reports');
    if (report.duplicateMeta) doc.text('Warning: Duplicate meta description in your reports');
    if (report.suggestions?.length) {
      doc.moveDown();
      doc.fontSize(11).text('Suggestions:', { underline: true });
      report.suggestions.forEach((s) => doc.text(`• ${s}`));
    }
    doc.end();
  });
}
