import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, setAccessToken } from '../api/axios.js';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    if (error) {
      setStatus(`Error: ${decodeURIComponent(error)}`);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }
    if (token) {
      setAccessToken(token);
      api
        .get('/auth/me')
        .then((res) => {
          login(res.data.user, token);
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          setStatus('Failed to complete sign in');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        });
    } else {
      setStatus('No token received');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <p className="text-gray-600 dark:text-gray-400">{status}</p>
    </div>
  );
}
