"use client";
import { useRouter } from "next/navigation";
import React from "react";

const VideoPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-yellow-50 flex flex-col items-center justify-center px-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg border border-white/20 hover:bg-white/20 transition"
      >
        ← Back
      </button>

      {/* Video Card */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-2xl p-6 max-w-3xl w-full flex flex-col items-center">
        <h1 className="text-white text-2xl font-semibold mb-4">How to Use</h1>

        <video
          src="/how-to-use.mp4"
          autoPlay
          loop
          muted
          controls
          className="rounded-xl w-full max-h-[500px] object-cover"
        />
      </div>
    </div>
  );
};

export default VideoPage;
