import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios.js';
import Card from '../components/Card.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [minScore, setMinScore] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchReports = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (minScore !== '') params.set('minScore', minScore);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (sort) params.set('sort', sort);
    api.get(`/reports?${params}`).then((res) => setReports(res.data)).catch(() => setReports([])).finally(() => setLoading(false));
  };

  useEffect(() => fetchReports(), [type, minScore, dateFrom, dateTo, sort]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Reports</h1>

      <Card className="p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <option value="">All</option>
            <option value="URL">URL</option>
            <option value="TEXT">TEXT</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min Score</label>
          <input type="number" min="0" max="100" value={minScore} onChange={(e) => setMinScore(e.target.value)} className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sort</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="scoreDesc">Score (high first)</option>
            <option value="scoreAsc">Score (low first)</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full dark:bg-gray-700" />)}
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-gray-400">
          No reports yet. <Link to="/analyzer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Analyze a URL or content</Link> to get started.
        </Card>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r._id}>
              <Link to={`/reports/${r._id}`}>
                <Card className="p-4 hover:shadow-lg transition flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{r.type}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate block">{r.input || r.url}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{r.title || 'No title'} · {r.wordCount ?? 0} words</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-gray-900 dark:text-white">{r.score ?? '—'}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm">View</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
