import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// Re-using the same logo component from App.jsx for consistency
const SpectrumLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9C6 7.34315 7.34315 6 9 6H21C22.6569 6 24 7.34315 24 9V39C24 40.6569 22.6569 42 21 42H9C7.34315 42 6 40.6569 6 39V9Z" fill="#A5B4FC"/>
    <path d="M18 9C18 7.34315 19.3431 6 21 6H33C34.6569 6 36 7.34315 36 9V39C36 40.6569 34.6569 42 33 42H21C19.3431 42 18 40.6569 18 39V9Z" fill="#818CF8"/>
    <path d="M30 9C30 7.34315 31.3431 6 33 6H39C40.6569 6 42 7.34315 42 9V39C42 40.6569 40.6569 42 39 42H33C31.3431 42 30 40.6569 30 39V9Z" fill="#6366F1"/>
  </svg>
);

const Login = ({ onToggleView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to sign in. Please check your email and password.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      {/* NEW: Added consistent header */}
      <header className="text-center mb-8">
        <SpectrumLogo />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mt-4">
          Spectrum
        </h1>
      </header>
      
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 mt-1">Sign in to continue.</p>
        </div>
        
        {error && <p className="text-sm text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700 block mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button onClick={onToggleView} className="font-medium text-indigo-600 hover:underline">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
