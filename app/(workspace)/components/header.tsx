'use client'
import { Upload, FileText, Crown, User, Menu, X, LayoutDashboard, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from "react";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pdfs, setPdfs] = useState([
    { id: 1, name: 'Marketing Report Q4.pdf', uploadDate: '2024-12-20', pages: 24 },
    { id: 2, name: 'Financial Analysis.pdf', uploadDate: '2024-12-18', pages: 18 }
  ]);
  

  const progressValue = (pdfs.length / 5) * 100;
    const handleFileUpload = (e: any) => {
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
    <>
     <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
          <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">Axis</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-900 w-full hover:bg-slate-200 transition-colors font-medium text-sm">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 w-full hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm">
            <Upload size={18} />
            <span>Upload PDF</span>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>

          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 w-full hover:bg-slate-100 transition-colors font-medium text-sm group">
            <Crown size={18} className="text-amber-500" />
            <span>Upgrade</span>
            <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-semibold">PRO</span>
          </button>
        </nav>

        {/* Progress Section */}
        <div className="p-6 border-t border-slate-200 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Storage</span>
              <span className="text-sm font-semibold text-slate-900">{pdfs.length}/5 PDFs</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-slate-500 mt-3">
              {5 - pdfs.length} upload{5 - pdfs.length !== 1 ? 's' : ''} remaining on free plan
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium">
            <Sparkles size={16} />
            Upgrade Plan
          </button>
        </div>
      </aside>
      </>
  )
}