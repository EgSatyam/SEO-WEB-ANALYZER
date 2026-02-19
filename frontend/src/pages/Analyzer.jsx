import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios.js';
import { useToast } from '../components/ToastProvider.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Tabs from '../components/Tabs.jsx';

function ScoreGauge({ score }) {
  const s = score ?? 0;
  const borderColor = s >= 70 ? 'border-green-500' : s >= 40 ? 'border-yellow-500' : 'border-red-500';
  const textColor = s >= 70 ? 'text-green-500' : s >= 40 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`w-32 h-32 rounded-full border-4 ${borderColor} flex items-center justify-center`}>
        <span className={`text-3xl font-bold ${textColor}`}>{s}</span>
      </div>
      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">SEO Score</span>
    </div>
  );
}

export default function Analyzer() {
  const [mode, setMode] = useState('url');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = mode === 'url' ? { mode: 'url', url: url.startsWith('http') ? url : `https://${url}` } : { mode: 'text', content };
    if (mode === 'url' && !url.trim()) return;
    if (mode === 'text' && !content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/reports', body);
      setResult(data);
      addToast('Report saved', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const r = result;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SEO Analyzer</h1>

      <Card className="p-6 mb-6">
        <Tabs tabs={[{ id: 'url', label: 'URL Analysis' }, { id: 'text', label: 'Paste Content' }]} activeTab={mode} onTabChange={setMode} />
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {mode === 'url' ? (
            <Input label="URL" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTML or text</label>
              <textarea placeholder="Paste content..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[160px]" required />
            </div>
          )}
          <Button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</Button>
        </form>
      </Card>

      {r && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 flex flex-col items-center">
              <ScoreGauge score={r.score} />
            </Card>
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Page Overview</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500 dark:text-gray-400">Title</dt><dd className="text-gray-900 dark:text-white">{r.title || '—'}</dd></div>
                <div><dt className="text-gray-500 dark:text-gray-400">Meta Description</dt><dd className="text-gray-900 dark:text-white">{r.metaDescription || '—'}</dd></div>
                <div><dt className="text-gray-500 dark:text-gray-400">Word Count</dt><dd className="text-gray-900 dark:text-white">{r.wordCount ?? 0}</dd></div>
                {r.keywords?.length > 0 && <div><dt className="text-gray-500 dark:text-gray-400">Keywords</dt><dd className="text-gray-900 dark:text-white">{r.keywords.slice(0, 8).join(', ')}</dd></div>}
              </dl>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Headings</h3>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">H1</span> {r.headings?.h1?.length ?? 0} <br />{(r.headings?.h1 || []).slice(0, 2).map((h, i) => <span key={i} className="block truncate">{h}</span>)}</div>
              <div><span className="text-gray-500 dark:text-gray-400">H2</span> {r.headings?.h2?.length ?? 0}</div>
              <div><span className="text-gray-500 dark:text-gray-400">H3</span> {r.headings?.h3?.length ?? 0}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Images & Links</h3>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>Image Alt: {r.images?.withAlt ?? 0}/{r.images?.total ?? 0} ({r.images?.altCoverage ?? 0}%)</div>
              <div>Internal: {r.linkStats?.internal ?? 0} · External: {r.linkStats?.external ?? 0} · Broken: {r.brokenCount ?? 0}</div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content & Keywords</h3>
            <div className="space-y-2 text-sm">
              <p>Keyword density: {r.keywordDensity?.map((k) => `${k.keyword} ${k.density}%`).join(', ') || '—'}</p>
              <p>Sentiment: {r.sentiment?.label ?? '—'} · Readability: {r.readabilityScore ?? '—'}</p>
            </div>
          </Card>

          {r.suggestions?.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Suggestions</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {r.suggestions.map((s, i) => <li key={i}>{typeof s === 'string' ? s : s?.text}</li>)}
              </ul>
            </Card>
          )}

          <div className="flex gap-4">
            <Button onClick={() => navigate(`/reports/${r._id}`)}>View full report</Button>
          </div>
        </div>
      )}
    </div>
  );
}
