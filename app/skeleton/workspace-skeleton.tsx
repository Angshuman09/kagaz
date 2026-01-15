import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const WorkspaceSkeleton = () => {
    return (
        <div className="flex flex-col h-screen">
            {/* Header Skeleton */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden p-4">
                <div className="flex h-full gap-2">
                    {/* Left Panel - Note Taking Skeleton */}
                    <div className="flex-1 flex flex-col gap-3 border rounded-lg p-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>

                    {/* Resize Handle Visual */}
                    <div className="w-2 cursor-col-resize hover:bg-gray-200 transition-colors rounded" />

                    {/* Right Panel - PDF Viewer Skeleton */}
                    <div className="flex-1 border rounded-lg p-4">
                        <div className="flex flex-col h-full gap-4">
                            {/* PDF Toolbar */}
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                                <Skeleton className="h-8 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>

                            {/* PDF Content */}
                            <div className="flex-1 bg-gray-50 rounded flex items-center justify-center">
                                <div className="space-y-4 w-full max-w-2xl px-8">
                                    <Skeleton className="h-64 w-full" />
                                    <Skeleton className="h-4 w-3/4 mx-auto" />
                                    <Skeleton className="h-4 w-2/3 mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};