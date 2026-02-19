import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/axios.js';
import { useToast } from '../components/ToastProvider.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Tabs from '../components/Tabs.jsx';

const MAX_RECENT_REPORTS = 4;
const REPORT_DOT_COLORS = ['bg-amber-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-blue-500'];

function getReportTitle(r) {
  return r.title || r.input || r.url || 'Report';
}

function getReportSubtitle(r) {
  if (r.url) {
    try {
      const u = new URL(r.url.startsWith('http') ? r.url : `https://${r.url}`);
      return u.hostname;
    } catch {
      return r.url;
    }
  }
  return r.input ? (r.input.slice(0, 50) + (r.input.length > 50 ? '…' : '')) : '—';
}

function formatReportDate(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-48">
          <div className="absolute top-0 left-0 w-52 h-36 bg-gray-700/80 rounded-lg border border-gray-600/50 shadow-xl">
            <div className="h-6 bg-gray-600/80 rounded-t-lg flex items-center px-2 gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="w-2 h-2 rounded-full bg-gray-500" />
            </div>
            <div className="p-2">
              <div className="h-1.5 w-3/4 bg-gray-600 rounded mb-2" />
              <div className="h-1 w-full bg-gray-600/70 rounded mb-1" />
              <div className="h-1 w-5/6 bg-gray-600/70 rounded" />
            </div>
          </div>
          <div className="absolute top-6 left-8 w-48 h-32 bg-gray-600/90 rounded-lg border border-gray-500/50 shadow-xl">
            <div className="h-5 bg-gray-500/80 rounded-t-lg flex items-center px-2 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            </div>
            <div className="p-2 flex gap-1 items-end">
              <div className="w-4 h-8 bg-blue-500 rounded-sm" />
              <div className="w-4 h-6 bg-emerald-500 rounded-sm" />
              <div className="w-4 h-10 bg-blue-600 rounded-sm" />
              <div className="w-4 h-4 bg-red-500/80 rounded-sm" />
              <div className="w-4 h-7 bg-blue-400 rounded-sm" />
            </div>
          </div>
          <div className="absolute -top-2 right-4 w-20 h-20 flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border-4 border-blue-600 bg-blue-900/40" />
            <div className="absolute w-8 h-8 rounded-full border-4 border-white/90 bg-transparent -bottom-1 -right-1" />
            <div className="absolute w-2 h-10 bg-blue-600 rounded-full rotate-45 origin-bottom right-2 bottom-2" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
        {[3, 5, 4, 7, 6, 9, 11].map((h, i) => (
          <div key={i} className="w-2 bg-amber-400/90 rounded-t" style={{ height: `${h * 6}px` }} />
        ))}
      </div>
      <div className="absolute top-4 right-8 w-3 h-3 bg-blue-400 rounded-full opacity-80" />
      <div className="absolute top-16 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-70" />
      <div className="absolute bottom-16 left-12 w-2 h-2 bg-amber-300 rounded-full opacity-70" />
      <div className="absolute bottom-8 right-16 w-4 h-4 border-2 border-blue-400/60 rounded-sm rotate-12" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState([]);
  const [analyzeMode, setAnalyzeMode] = useState('url');
  const [analyzeInput, setAnalyzeInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    api
      .get('/reports')
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setRecentReports(list.slice(0, 4));
      })
      .catch(() => setRecentReports([]));
  }, []);

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname, location.hash]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const trimmed = analyzeInput.trim();
    if (!trimmed) return;
    setAnalyzing(true);
    try {
      const body = analyzeMode === 'url' ? { mode: 'url', url: trimmed.startsWith('http') ? trimmed : `https://${trimmed}` } : { mode: 'text', content: trimmed };
      const { data } = await api.post('/reports', body);
      addToast('Report created', 'success');
      navigate(`/reports/${data._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0f172a] text-white">
      {/* Hero section (first landing) */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 lg:pt-28 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Optimize Your Website</h1>
            <p className="text-5xl lg:text-6xl font-bold text-white mb-4">SEO</p>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Analyze URLs and improve your SEO performance.
            </p>
            <Link to="/analyzer">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="relative">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <div className="w-full h-12 bg-[#0f172a] relative">
        <svg className="absolute bottom-0 w-full h-8 text-[#0f172a]" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 24Q360 0 720 24T1440 24V48H0Z" fill="currentColor" opacity="0.03" />
        </svg>
      </div>

      {/* Welcome back + Quick Analysis + Recent Reports (second / dashboard view) */}
      <section className="bg-gray-900/50 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-8">
            Welcome back, {user?.name || 'User'}!
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6 bg-gray-800/80 border border-gray-700/50">
              <h3 className="font-semibold text-white mb-4">Quick Analysis</h3>
              <Tabs
                tabs={[{ id: 'url', label: 'URL Analysis' }, { id: 'text', label: 'Paste Content' }]}
                activeTab={analyzeMode}
                onTabChange={setAnalyzeMode}
              />
              <form onSubmit={handleAnalyze} className="mt-4 flex gap-3">
                {analyzeMode === 'url' ? (
                  <input
                    type="text"
                    placeholder="Enter URL to analyze..."
                    value={analyzeInput}
                    onChange={(e) => setAnalyzeInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <textarea
                    placeholder="Paste HTML or text..."
                    value={analyzeInput}
                    onChange={(e) => setAnalyzeInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 min-h-[44px] resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                )}
                <Button type="submit" disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 text-white shrink-0">
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </form>
            </Card>

            <Card className="p-6 bg-gray-800/80 border border-gray-700/50">
              <h3 className="font-semibold text-white mb-4">Recent Reports</h3>
              {recentReports.length === 0 ? (
                <p className="text-gray-400 text-sm">No reports yet.</p>
              ) : (
                <ul className="space-y-0">
                  {recentReports.map((r, index) => (
                    <li key={r._id || r.id || index}>
                      <Link
                        to={`/reports/${r._id || r.id}`}
                        className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg hover:bg-gray-700/50 transition group"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${REPORT_DOT_COLORS[index % MAX_RECENT_REPORTS]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">{getReportTitle(r)}</p>
                          <p className="text-sm text-gray-400 truncate">{getReportSubtitle(r)}</p>
                        </div>
                        <span className="text-sm text-gray-500 shrink-0">{formatReportDate(r.createdAt)}</span>
                        <span className="text-blue-400 text-sm shrink-0 flex items-center gap-0.5 group-hover:text-blue-300">
                          View
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/reports" className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300">
                All reports
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-900/30 border-t border-white/5 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 bg-gray-800/80 border border-gray-700/50">
              <h3 className="font-semibold text-white mb-2">URL &amp; content analysis</h3>
              <p className="text-gray-400 text-sm">Analyze any URL or paste content for SEO: title, meta, headings, readability, and keywords.</p>
            </Card>
            <Card className="p-6 bg-gray-800/80 border border-gray-700/50">
              <h3 className="font-semibold text-white mb-2">SEO score &amp; reports</h3>
              <p className="text-gray-400 text-sm">Get a clear score and actionable recommendations for each report.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing - full content */}
      <section id="pricing" className="bg-gray-900/50 border-t border-white/5 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Pricing</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 bg-gray-800/80 border border-gray-700/50 text-center">
              <h3 className="font-semibold text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-white mb-1">$0</p>
              <p className="text-gray-400 text-sm mb-4">per month · Forever free for basic analysis</p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 text-left">
                <li>URL &amp; content analysis</li>
                <li>SEO score &amp; reports</li>
                <li>Keyword insights</li>
              </ul>
              <Link to="/analyzer">
                <Button className="w-full bg-gray-600 hover:bg-gray-500 text-white">Get Started</Button>
              </Link>
            </Card>
            <Card className="p-6 bg-gray-800/80 border border-blue-500/50 text-center relative">
              <span className="absolute top-3 right-3 text-xs font-medium text-blue-400">Popular</span>
              <h3 className="font-semibold text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-white mb-1">$19</p>
              <p className="text-gray-400 text-sm mb-4">per month · More power for teams (coming soon)</p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 text-left">
                <li>Everything in Free</li>
                <li>Bulk analysis</li>
                <li>Export &amp; API</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled>Notify me</Button>
            </Card>
            <Card className="p-6 bg-gray-800/80 border border-gray-700/50 text-center">
              <h3 className="font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-white mb-1">From $99</p>
              <p className="text-gray-400 text-sm mb-4">per month · For large organizations</p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6 text-left">
                <li>Everything in Pro</li>
                <li>SSO &amp; compliance</li>
                <li>Dedicated support</li>
              </ul>
              <Button className="w-full bg-gray-600 hover:bg-gray-500 text-white" disabled>Contact sales</Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
