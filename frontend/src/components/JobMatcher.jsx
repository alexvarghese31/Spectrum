import React, { useState } from 'react';

// --- Reusable Child Components ---

const Spinner = () => (
  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
);

const MatchScoreBar = ({ score }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <span className="text-base font-medium text-indigo-700">Overall Match Score</span>
      <span className="text-sm font-medium text-indigo-700">{score}%</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

const KeywordsList = ({ title, keywords, icon, colorTheme, message }) => (
  <div>
    <h5 className="font-semibold text-slate-700 mb-2">{icon} {title}</h5>
    {keywords.length > 0 ? (
      <>
        {message && <p className="text-sm text-slate-500 mb-2">{message}</p>}
        <div className="flex flex-wrap gap-2">
          {keywords.map(skill => (
            <span key={skill} className={`bg-${colorTheme}-100 text-${colorTheme}-800 text-xs font-medium px-2.5 py-1 rounded-full`}>
              {skill}
            </span>
          ))}
        </div>
      </>
    ) : (
      <p className="text-sm text-slate-500 italic">
        {title === 'Matched Keywords' ? 'No direct skill matches found.' : 'Great job! No missing skills found.'}
      </p>
    )}
  </div>
);

const MatchAnalysis = ({ result }) => (
  <div className="mt-6">
    <h4 className="font-bold text-lg text-slate-800 mb-3">Match Analysis</h4>
    <MatchScoreBar score={result.match_score} />
    <div className="mb-4">
      <KeywordsList 
        title="Matched Keywords"
        keywords={result.matched_keywords}
        icon="✅"
        colorTheme="green"
      />
    </div>
    <KeywordsList 
      title="Missing Keywords to Add"
      keywords={result.missing_keywords}
      icon="💡"
      colorTheme="amber"
      message="Consider adding these skills from the job description if you have them:"
    />
  </div>
);


// --- Main Parent Component ---

const JobMatcher = ({ resumeSkills }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the environment variable for the API URL
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/match/`;

  const handleMatch = async () => {
    setIsLoading(true);
    setError(null);
    setMatchResult(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_skills: resumeSkills,
          job_description_text: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMatchResult(data);

    } catch (err) {
      console.error("Failed to match skills:", err);
      setError("Could not connect to the analysis engine. Please ensure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Job Description Matcher</h3>
      <p className="text-slate-600 mb-4 text-sm">Paste a job description below to see how your skills match up.</p>
      
      <textarea
        className="w-full h-40 p-3 bg-slate-50 text-slate-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        placeholder="Paste job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      
      <div className="text-center mt-4">
        <button
          onClick={handleMatch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[150px]"
          disabled={!jobDescription || isLoading}
        >
          {isLoading ? <Spinner /> : 'Match Skills'}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
          {error}
        </div>
      )}

      {matchResult && <MatchAnalysis result={matchResult} />}
    </div>
  );
};

export default JobMatcher;
