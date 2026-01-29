'use client'
import { FileText, Upload } from 'lucide-react';

import React, { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Upgrade from './upgrade/page';
import { usePathname } from 'next/navigation';
import {Sidebar} from '../components/sidebar'
import Header from '../components/header'

export default function Dashboard() {

  const path = usePathname();

  const { user } = useUser();
  // const [loading, setLoading] = useState(false);

  const getAllFiles = useQuery(api.fileStorage.getUserFiles,{
    userEmail: user?.primaryEmailAddress?.emailAddress as string
  })

  return (
    <>
      {/* Mobile Menu Button */}
      {path === '/dashboard/upgrade' && <Upgrade/>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
                  <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                     {/* Skeleton Preview */}
                    <Skeleton className="h-40 w-full rounded-none" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <div className="flex justify-between">
                         <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            </div>
          ) : getAllFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-base font-semibold text-slate-900">Recent Documents</h2>
                <p className="text-sm text-slate-500">You have {getAllFiles.length} document{getAllFiles.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getAllFiles.map((pdf, index) => (
                  
                    <button
                    key={index}
                    className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden text-left group"
                  >
                    <Link href={`/workspace/${pdf.fileId}`}>
                    {/* PDF Preview */}
                    <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-200 group-hover:bg-slate-100 transition-colors">
                      <FileText size={48} className="text-slate-300" />
                    </div>

                    {/* PDF Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900 mb-2 truncate text-sm">
                        {pdf?.fileName}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {/* <span>{} pages</span> */}
                        {/* <span>{pdf?._creationTime}</span> */}
                      </div>
                    </div>
                    </Link>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}