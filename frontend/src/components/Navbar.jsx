import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardClick = (e) => {
    if (location.pathname === '/dashboard') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-[#0f172a] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-white">
          <ShieldIcon className="w-6 h-6 text-white" />
          SEO Web Analyzer
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/dashboard#features" className="text-gray-300 hover:text-white transition">
            Features
          </Link>
          <Link to="/dashboard#pricing" className="text-gray-300 hover:text-white transition">
            Pricing
          </Link>
          <Link to="/dashboard" onClick={handleDashboardClick} className="text-gray-300 hover:text-white transition">
            Dashboard
          </Link>
          <Link to="/reports" className="text-gray-300 hover:text-white transition">
            Reports
          </Link>
          <Button variant="primary" onClick={handleLogout} className="bg-blue-600 hover:bg-blue-500 text-white">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
