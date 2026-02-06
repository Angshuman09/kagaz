"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VideoPage = () => {
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8">
      <Button
      variant={"outline"}
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-6 py-3 bg-white shadow-md text-gray-700 rounded-lg transition-all duration-300 font-medium"
      >
        ← Back
      </Button>

      <div className="max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-8">
          How to Use
        </h1>

        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8">
          {videoError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-gray-600 text-lg">
                Video failed to load. Please refresh the page.
              </p>
            </div>
          ) : (
            <video
              src="/how-to-use.mp4"
              autoPlay
              loop
              muted
              controls
              onError={() => setVideoError(true)}
              className="rounded-xl w-full max-h-[600px] object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;