import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Import auth from your firebase config

// Import your new components
import Login from './components/Login';
import SignUp from './components/SignUp';

// Import your existing components
import FileUploader from './components/FileUploader';
import Loader from './components/Loader';
import AnalysisDisplay from './components/AnalysisDisplay';

const SpectrumLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9C6 7.34315 7.34315 6 9 6H21C22.6569 6 24 7.34315 24 9V39C24 40.6569 22.6569 42 21 42H9C7.34315 42 6 40.6569 6 39V9Z" fill="#A5B4FC"/>
    <path d="M18 9C18 7.34315 19.3431 6 21 6H33C34.6569 6 36 7.34315 36 9V39C36 40.6569 34.6569 42 33 42H21C19.3431 42 18 40.6569 18 39V9Z" fill="#818CF8"/>
    <path d="M30 9C30 7.34315 31.3431 6 33 6H39C40.6569 6 42 7.34315 42 9V39C42 40.6569 40.6569 42 39 42H33C31.3431 42 30 40.6569 30 39V9Z" fill="#6366F1"/>
  </svg>
);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- New Authentication State ---
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true); // To toggle between Login and SignUp

  // Listener for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // We still reset here as a fallback for session timeouts, etc.
      if (!currentUser) {
        handleReset();
      }
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  // --- Core Analyzer Logic (Unchanged) ---
  const handleAnalyze = async (file) => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error("There was an error processing the file:", e);
      setError(`Failed to analyze resume. ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      // FIXED: Call handleReset() before signing out to clear the UI.
      handleReset();
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- Conditional Rendering ---
  if (!user) {
    return isLoginView ? (
      <Login onToggleView={() => setIsLoginView(false)} />
    ) : (
      <SignUp onToggleView={() => setIsLoginView(true)} />
    );
  }

  // --- Main App View (for logged-in users) ---
  return (
    <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center p-4 sm:p-8 font-sans relative">
      {/* NEW: Sign Out button moved here and positioned relative to the whole page */}
      <button 
        onClick={handleSignOut}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
      >
        Sign Out
      </button>

      <header className="w-full max-w-5xl mx-auto my-8">
        <div className="text-center">
          <div className="flex justify-center items-center">
            <SpectrumLogo />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mt-4">
            Spectrum
          </h1>
          <p className="text-slate-600 mt-3 text-lg">
            Illuminate your resume's potential. Get an instant, full-spectrum analysis.
          </p>
        </div>
      </header>
      
      <main className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-auto">
        {isLoading ? (
          <Loader />
        ) : analysisResult ? (
          <AnalysisDisplay result={analysisResult} onReset={handleReset} />
        ) : (
          <FileUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
        {error && <div className="text-red-500 mt-4 text-center font-semibold">{error}</div>}
      </main>
    </div>
  );
}

export default App;
