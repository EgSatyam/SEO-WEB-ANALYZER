import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/axios.js';
import { useToast } from '../components/ToastProvider.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Skeleton from '../components/Skeleton.jsx';

function ScoreGauge({ score }) {
  const s = score ?? 0;
  const borderColor = s >= 70 ? 'border-green-500' : s >= 40 ? 'border-yellow-500' : 'border-red-500';
  const textColor = s >= 70 ? 'text-green-500' : s >= 40 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`w-28 h-28 rounded-full border-4 ${borderColor} flex items-center justify-center`}>
        <span className={`text-2xl font-bold ${textColor}`}>{s}</span>
      </div>
      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Score</span>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setReport(res.data)).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const { data } = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-report-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('PDF downloaded', 'success');
    } catch (err) {
      addToast('Download failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4 dark:bg-gray-700" />
        <Skeleton className="h-64 w-full dark:bg-gray-700" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500 dark:text-gray-400">Report not found.</p>
        <Link to="/reports" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">Back to Reports</Link>
      </div>
    );
  }

  const { url, title, metaDescription, headings, wordCount, readabilityScore, sentiment, keywords, keywordDensity, primaryKeyword, images, linkStats, brokenCount, suggestions, duplicateTitle, duplicateMeta, score } = report;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Details</h1>
        <Button onClick={handleDownloadPdf} disabled={downloading}>
          {downloading ? 'Downloading...' : 'Export PDF'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="p-6 flex flex-col items-center">
          <ScoreGauge score={score} />
        </Card>
        <Card className="p-6 md:col-span-2 bg-white dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Overview</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500 dark:text-gray-400">Input:</span> {report.input || url || '—'}</p>
            <p><span className="text-gray-500 dark:text-gray-400">Title:</span> {title || '—'}</p>
            <p><span className="text-gray-500 dark:text-gray-400">Meta:</span> {metaDescription || '—'}</p>
            {(duplicateTitle || duplicateMeta) && (
              <p className="text-amber-600 dark:text-amber-400">Duplicate title or meta in your reports.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content & structure</h3>
        <dl className="grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="text-gray-500 dark:text-gray-400">Word count</dt><dd className="text-gray-900 dark:text-white">{wordCount ?? 0}</dd></div>
          <div><dt className="text-gray-500 dark:text-gray-400">Readability</dt><dd className="text-gray-900 dark:text-white">{readabilityScore ?? '—'}</dd></div>
          <div><dt className="text-gray-500 dark:text-gray-400">Sentiment</dt><dd className="text-gray-900 dark:text-white capitalize">{sentiment?.label ?? '—'}</dd></div>
          <div><dt className="text-gray-500 dark:text-gray-400">Primary keyword</dt><dd className="text-gray-900 dark:text-white">{primaryKeyword ?? '—'}</dd></div>
        </dl>
        {headings && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><h4 className="text-gray-500 dark:text-gray-400 text-xs mb-1">H1</h4><ul className="list-disc list-inside text-sm">{(headings.h1 || []).slice(0, 3).map((h, i) => <li key={i}>{h}</li>)}</ul></div>
            <div><h4 className="text-gray-500 dark:text-gray-400 text-xs mb-1">H2</h4><ul className="list-disc list-inside text-sm">{(headings.h2 || []).slice(0, 3).map((h, i) => <li key={i}>{h}</li>)}</ul></div>
            <div><h4 className="text-gray-500 dark:text-gray-400 text-xs mb-1">H3</h4><ul className="list-disc list-inside text-sm">{(headings.h3 || []).slice(0, 3).map((h, i) => <li key={i}>{h}</li>)}</ul></div>
          </div>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Images & links</h3>
        <p className="text-sm">Images: {images?.withAlt ?? 0}/{images?.total ?? 0} with alt ({images?.altCoverage ?? 0}% coverage)</p>
        <p className="text-sm">Internal: {linkStats?.internal ?? 0} · External: {linkStats?.external ?? 0} · Broken: {brokenCount ?? 0}</p>
      </Card>

      {keywords?.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{keywords.join(', ')}</p>
          {keywordDensity?.length > 0 && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Density: {keywordDensity.map((k) => `${k.keyword} ${k.density}%`).join(', ')}</p>}
        </Card>
      )}

      {suggestions?.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key recommendations</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {suggestions.map((s, i) => <li key={i}>{typeof s === 'string' ? s : s?.text}</li>)}
          </ul>
        </Card>
      )}

      <Link to="/reports" className="text-indigo-600 dark:text-indigo-400 hover:underline">← Back to Reports</Link>
    </div>
  );
}
