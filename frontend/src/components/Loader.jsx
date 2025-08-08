import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      {/* Added dark: variants for border and text colors */}
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-slate-200 dark:border-slate-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 dark:text-slate-400">Analyzing your resume...</p>
    </div>
  );
};

export default Loader;
