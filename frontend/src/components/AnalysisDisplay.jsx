import React from 'react';
import ResumeInsights from './ResumeInsights';
import JobMatcher from './JobMatcher';

const InfoPill = ({ label, value, className = '' }) => {
  if (!value) return null;
  return (
    <div className={`bg-slate-100 p-3 rounded-lg ${className}`}>
      <span className="text-xs text-slate-500 block">{label}</span>
      <span className="text-base text-slate-800 font-semibold">{value}</span>
    </div>
  );
};

const AnalysisDisplay = ({ result, onReset }) => {
  const { parsed_data, skill_analysis } = result;

  const getValidSkillCategories = () => {
    if (!skill_analysis || !skill_analysis.categories) return [];
    return Object.entries(skill_analysis.categories).filter(([_, skills]) => skills.length > 0);
  };

  const validSkillCategories = getValidSkillCategories();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Analysis Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoPill label="Name" value={parsed_data.name} />
        <InfoPill label="Email" value={parsed_data.email} />
        <InfoPill label="Mobile" value={parsed_data.mobile_number} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Skill Analysis</h3>
        
        {validSkillCategories.length > 0 ? (
          <div className="space-y-4">
            {validSkillCategories.map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-indigo-600 font-semibold mb-2 capitalize">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No skills were categorized from the resume.</p>
        )}
      </div>

      <ResumeInsights result={result} />

      <JobMatcher resumeSkills={parsed_data.skills || []} />

      <div className="flex justify-center mt-8">
        <button 
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Analyze Another
        </button>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
