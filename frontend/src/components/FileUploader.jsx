import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

const FileUploader = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      alert('File is too large. Please select a file smaller than 5MB.');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 5 * 1024 * 1024) {
      setFile(droppedFile);
    } else {
      alert('File is too large. Please select a file smaller than 5MB.');
    }
  };
  
  const handleAnalyzeClick = () => { if (file) { onAnalyze(file); } };
  const openFileDialog = () => { fileInputRef.current.click(); };
  const clearFile = () => { setFile(null); };

  return (
    <div className="w-full flex flex-col items-center">
      {/* The main dropzone area */}
      <div
        className={`w-full max-w-lg p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-indigo-50 bg-indigo-50' 
            : 'border-slate-300 bg-slate-100'}
          ${file ? 'border-indigo-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
        
        {/* The "Upload" icon and text */}
        {!file ? (
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="w-16 h-16 text-slate-400 mb-4" />
            <p className="text-slate-700 font-semibold">
              <span className="text-indigo-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-slate-500 text-sm mt-1">PDF or DOCX (MAX. 5MB)</p>
          </div>
        ) : (
          // The "File selected" view
          <div className="flex flex-col items-center pointer-events-none">
            <FileIcon className="w-16 h-16 text-indigo-600 mb-4" />
            <p className="text-slate-700 font-semibold">{file.name}</p>
            <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            <button 
              onClick={(e) => { e.stopPropagation(); clearFile(); }} 
              className="mt-4 p-1 rounded-full bg-slate-200 hover:bg-red-500/20 transition-colors pointer-events-auto"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* The "Analyze" button */}
      <button
        onClick={handleAnalyzeClick}
        disabled={!file || isLoading}
        className="mt-6 w-full max-w-lg py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300
                   bg-indigo-600 hover:bg-indigo-700
                   disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Resume'}
      </button>
    </div>
  );
};

export default FileUploader;
