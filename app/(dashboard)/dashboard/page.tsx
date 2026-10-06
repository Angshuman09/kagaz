'use client'
import { ArrowUpRight, FileText, Trash2, Upload } from 'lucide-react';

import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Upgrade from './upgrade/page';
import { usePathname } from 'next/navigation';
import Header from '../components/header'
import { DeleteFileDialog } from '@/components/delete-file-dialog';
import { FileUpload } from '../components/file-upload';
import { PdfPreview } from '@/components/pdf-preview';

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Dashboard() {

  const path = usePathname();

  const { user } = useUser();

  const [fileToDelete, setFileToDelete] = useState<{ fileId: string; fileName: string } | null>(null);

  const getAllFiles = useQuery(api.fileStorage.getUserFiles,{
    userEmail: user?.primaryEmailAddress?.emailAddress as string
  })

  return (
    <>
      {/* Mobile Menu Button */}
      {path === '/dashboard/upgrade' && <Upgrade/>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/70">
        {/* Header */}
        <Header name="Dashboard"/>

        {/* PDF Grid */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {getAllFiles === undefined ? (
            <div>
              <div className="mb-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    {/* Skeleton Preview */}
                    <Skeleton className="h-48 w-full rounded-none" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : getAllFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl bg-indigo-200/40 blur-xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center">
                  <FileText size={28} className="text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Upload a PDF to start taking notes alongside it, with AI answers grounded in your document.
              </p>
              <FileUpload>
                <Button className="rounded-full px-6 shadow-sm gap-2">
                  <Upload size={16} />
                  Upload your first PDF
                </Button>
              </FileUpload>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent Documents</h2>
                  <p className="text-sm text-slate-500">
                    You have {getAllFiles.length} document{getAllFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80 shadow-sm">
                  {getAllFiles.length}/5 used
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {getAllFiles.map((pdf) => (
                  <div
                    key={pdf.fileId}
                    className="group relative bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 text-left"
                  >
                    <button
                      type="button"
                      aria-label={`Delete ${pdf?.fileName}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFileToDelete({ fileId: pdf.fileId, fileName: pdf.fileName });
                      }}
                      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg bg-white/90 border border-slate-200/80 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>

                    <Link href={`/workspace/${pdf.fileId}`} className="block">
                      {/* PDF first-page preview */}
                      <div className="relative h-48 border-b border-slate-100 bg-slate-50">
                        <PdfPreview fileUrl={pdf.fileUrl} />
                        <span className="absolute top-3 left-3 z-10 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
                          PDF
                        </span>
                      </div>

                      {/* PDF Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 truncate text-sm">
                          {pdf?.fileName}
                        </h3>
                        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                          <span>{formatDate(pdf._creationTime)}</span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-400 transition-colors group-hover:text-black">
                            Open
                            <ArrowUpRight
                              size={13}
                              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <DeleteFileDialog
        open={fileToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setFileToDelete(null);
        }}
        fileId={fileToDelete?.fileId ?? null}
        fileName={fileToDelete?.fileName ?? null}
      />
    </>
  );
}
