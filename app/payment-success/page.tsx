'use client'

import { Check, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
    const router = useRouter();
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <Check className="w-12 h-12 text-black stroke-3" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#D4AF37] animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-white mb-3">
            Payment Successful
          </h1>
          <p className="text-gray-400 font-light">
            Your transaction has been completed successfully
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <span className="text-gray-400 text-sm">Amount Paid</span>
              <span className="text-white text-lg font-light">$20</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Date</span>
              <span className="text-white text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button onClick={()=> router.push('/')} className="w-full bg-[#D4AF37] hover:bg-[#C19F2F] text-black font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Go to Home
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            A confirmation email has been sent to your inbox
          </p>
        </div>
      </div>
    </div>
  );
}