import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">SEO Web Analyzer</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        Analyze any URL or paste content for SEO: title, meta, headings, readability, sentiment, and keywords.
      </p>
      {user ? (
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
