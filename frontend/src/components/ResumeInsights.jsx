import React from 'react';
import {
  checkAtsFriendliness,
  countActionVerbs,
  checkResumeLength,
  detectBuzzwords,
  calculateOverallScore,
  getVerbSuggestions, // Import the new helper function
} from '../utils/AnalysisHelpers';
import { ACTION_VERBS } from '../utils/constants'; // We need the full list for suggestions
import { CheckCircle2, XCircle, FileText, Bot, BrainCircuit, AlertTriangle, Lightbulb, PlusCircle } from 'lucide-react';

const InsightCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 h-full">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 ml-3">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

const ResumeInsights = ({ result }) => {
  const atsChecks = checkAtsFriendliness(result);
  const { count: actionVerbCount, found: foundActionVerbs } = countActionVerbs(result.raw_text);
  const wordCount = checkResumeLength(result.raw_text);
  const buzzwordsFound = detectBuzzwords(result.raw_text);
  const overallScore = calculateOverallScore(result);
  
  // Get suggestions for overused verbs
  const verbSuggestions = getVerbSuggestions(result.raw_text);

  // Get suggestions for new verbs if the count is low
  const suggestedNewVerbs = ACTION_VERBS
    .filter(verb => !foundActionVerbs.includes(verb))
    .sort(() => 0.5 - Math.random()) // Shuffle to show different suggestions
    .slice(0, 5); // Get 5 random suggestions

  // --- Logic for Action Verbs card ---
  const getActionVerbStatus = (count) => {
    if (count >= 20) return { text: 'Excellent', color: 'text-green-600', progressColor: 'bg-green-500' };
    if (count >= 10) return { text: 'Good', color: 'text-indigo-600', progressColor: 'bg-indigo-500' };
    return { text: 'Needs Improvement', color: 'text-amber-600', progressColor: 'bg-amber-500' };
  };

  const actionVerbStatus = getActionVerbStatus(actionVerbCount);
  const actionVerbProgress = Math.min((actionVerbCount / 25) * 100, 100);

  // --- New helper logic for the Resume Length card ---
  const getWordCountStatus = (count) => {
    if (count > 600) return { text: 'Too Long', color: 'text-amber-600' };
    if (count >= 400) return { text: 'Good', color: 'text-green-600' };
    return { text: 'Too Short', color: 'text-amber-600' };
  };

  const wordCountStatus = getWordCountStatus(wordCount);

  return (
    <div className="animate-fade-in space-y-6 mt-6">
      <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
        <h2 className="text-6xl font-bold text-indigo-600">{overallScore}<span className="text-3xl text-slate-500">/10</span></h2>
        <p className="text-slate-500 mt-2">A summary of your resume's strength.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InsightCard title="ATS Checklist" icon={<Bot className="w-6 h-6 text-indigo-600" />}>
          <ul className="space-y-3">
            {Object.entries(atsChecks).map(([key, value]) => (
              <li key={key} className={`flex items-center text-slate-700`}>
                {value ? <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" /> : <XCircle className="w-5 h-5 mr-3 text-red-500" />}
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </li>
            ))}
          </ul>
        </InsightCard>

        <InsightCard title="Resume Length" icon={<FileText className="w-6 h-6 text-indigo-600" />}>
          <div className="flex items-baseline">
            <p className="text-5xl font-bold text-slate-800">{wordCount}</p>
            <p className="text-slate-500 ml-2">words</p>
          </div>
          <p className={`mt-2 font-semibold ${wordCountStatus.color}`}>{wordCountStatus.text}</p>
          <p className="text-xs text-slate-400 mt-1">Recommended: 400-600 words</p>
        </InsightCard>

        <InsightCard title="Action Verbs" icon={<BrainCircuit className="w-6 h-6 text-indigo-600" />}>
          <div className="flex items-baseline mb-2">
            <p className="text-5xl font-bold text-slate-800">{actionVerbCount}</p>
            <p className={`ml-2 font-semibold ${actionVerbStatus.color}`}>{actionVerbStatus.text}</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
            <div className={`h-2.5 rounded-full ${actionVerbStatus.progressColor}`} style={{ width: `${actionVerbProgress}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-1 mb-4">Recommended: 15-25 verbs</p>

          {/* RESTORED: Display the list of verbs used */}
          {foundActionVerbs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">Verbs You Used:</h4>
              <div className="flex flex-wrap gap-2">
                {foundActionVerbs.map(verb => (
                  <span key={verb} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">{verb}</span>
                ))}
              </div>
            </div>
          )}

          {/* Display suggestions for overused verbs */}
          {verbSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                Verb Variety Suggestions
              </h4>
              <div className="space-y-3">
                {verbSuggestions.map(({ verb, count, suggestions }) => (
                  <div key={verb}>
                    <p className="text-xs text-slate-500">
                      You used <strong className="text-slate-700">'{verb}'</strong> {count} times. Consider these alternatives:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestions.map(suggestion => (
                        <span key={suggestion} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">{suggestion}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESTORED: Display suggestions to add new verbs if count is low */}
          {actionVerbCount < 15 && verbSuggestions.length === 0 && (
             <div className="mt-4 pt-4 border-t border-slate-200">
               <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center">
                 <PlusCircle className="w-4 h-4 mr-2 text-green-500" />
                 Suggestions to Add:
               </h4>
               <div className="flex flex-wrap gap-2">
                 {suggestedNewVerbs.map(verb => (
                   <span key={verb} className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{verb}</span>
                 ))}
               </div>
             </div>
          )}
        </InsightCard>

        {buzzwordsFound.length > 0 && (
          <InsightCard title="Words to Reconsider" icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}>
             <p className="text-sm text-slate-500 mb-3">Using these clichés can weaken your resume. Consider replacing them:</p>
            <div className="flex flex-wrap gap-2">
              {buzzwordsFound.map(word => (
                <span key={word} className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {word}
                </span>
              ))}
            </div>
          </InsightCard>
        )}
      </div>
    </div>
  );
};

export default ResumeInsights;
