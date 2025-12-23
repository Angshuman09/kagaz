'use client'
import { FileText, Upload } from 'lucide-react';

import React, { useState } from 'react';
import { Header } from '../components/header';
export default function Dashboard() {
    const [pdfs, setPdfs] = useState([
    { id: 1, name: 'Marketing Report Q4.pdf', uploadDate: '2024-12-20', pages: 24 },
    { id: 2, name: 'Financial Analysis.pdf', uploadDate: '2024-12-18', pages: 18 }
  ]);
const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = files.map((file, index) => ({
      id: pdfs.length + index + 1,
      name: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      pages: Math.floor(Math.random() * 30) + 5
    }));
    setPdfs([...pdfs, ...newPdfs]);
  };
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <Header/>
      {/* Left Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Manage your documents</p>
            </div>
            <div className="lg:hidden">
              <h1 className="text-lg font-semibold text-slate-900 ml-12">Dashboard</h1>
            </div>
          </div>
          
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">John Doe</p>
              <p className="text-xs text-slate-500">Free Plan</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium hover:ring-2 hover:ring-slate-300 transition-all">
              JD
            </button>
          </div>
        </header>

        {/* PDF Grid */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {pdfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Upload your first PDF to get started with Axis
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer text-sm font-medium">
                <Upload size={16} />
                Upload PDF
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-900">Recent Documents</h2>
                <p className="text-sm text-slate-500">You have {pdfs.length} document{pdfs.length !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pdfs.map((pdf) => (
                  <button
                    key={pdf.id}
                    className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden text-left group"
                  >
                    {/* PDF Preview */}
                    <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-200 group-hover:bg-slate-100 transition-colors">
                      <FileText size={48} className="text-slate-300" />
                    </div>
                    
                    {/* PDF Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900 mb-2 truncate text-sm">
                        {pdf.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{pdf.pages} pages</span>
                        <span>{pdf.uploadDate}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}