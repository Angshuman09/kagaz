'use client'
import ShinyText from '@/components/ShinyText';
import { Heart, StarIcon } from 'lucide-react';
import { GithubIcon } from 'lucide-react';
import Link from 'next/link';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import Dashboard from './(dashboard)/dashboard/page';
import Pricing from './pricing';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  const handleGetStarted = async () => {
    if (user) {
      router.push('/dashboard')
    }
    else {
      router.push('/sign-in')
    }
  }
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-slate-200/50">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-6xl">
          <div onClick={() => router.push('/')} className="text-xl sm:text-2xl font-semibold text-slate-900 cursor-pointer">
            कागज़
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link
              scroll={false}
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}

              href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors text-xs sm:text-sm font-medium">
              Pricing
            </Link>
            {!user ? (
              <>
                <button onClick={() => router.push('/sign-in')} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  Log in
                </button>
                <button onClick={() => router.push('/sign-up')} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                  Get started
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/dashboard')} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                  Dashboard
                </button>

                <UserButton />
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center max-w-4xl">
        <Link
          href="https://github.com/Angshuman09/axis"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-3 py-1.5 mb-6 sm:mb-8 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellowstar animate-beat transition-colors" />
          <span className="hidden sm:inline">Star on GitHub</span>
          <span className="sm:hidden">Star us</span>
          <div className="w-px h-4 bg-black/10"></div>
          <StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
        </Link>


        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-slate-900 tracking-tight leading-tight px-2">
          Your <span className='text-[#D4AF37]'>intelligent</span> notebook <br className="hidden sm:block" />
          <span className="sm:hidden">for </span>
          <span className="hidden sm:inline">for any </span>document.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          Write, organize, and ask questions. Kagaz turns your notes into answers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          <button onClick={handleGetStarted} className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all text-sm w-full sm:w-auto cursor-pointer">
            Get started free →
          </button>
          <button className="px-6 py-3 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-sm w-full sm:w-auto cursor-pointer">
            See how it works
          </button>
        </div>

        {/* Simple Feature Pills */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-8 sm:mt-12 px-4">

          <div className="px-3 sm:px-4 py-2 bg-white border border-black/10 rounded-full text-xs sm:text-sm text-black flex items-center gap-2
                transition-all hover:shadow-sm hover:-translate-y-0.5 hover:border-black/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            <span className="whitespace-nowrap">Lightning fast</span>
          </div>

          <div className="px-3 sm:px-4 py-2 bg-white border border-black/10 rounded-full text-xs sm:text-sm text-black flex items-center gap-2
                transition-all hover:shadow-sm hover:-translate-y-0.5 hover:border-black/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            <span className="whitespace-nowrap">Secure & private</span>
          </div>

          <div className="px-3 sm:px-4 py-2 bg-white border border-black/10 rounded-full text-xs sm:text-sm text-black flex items-center gap-2
                transition-all hover:shadow-sm hover:-translate-y-0.5 hover:border-black/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            <span className="whitespace-nowrap">AI-powered</span>
          </div>

        </div>


      </section>

      {/* Pricing Section */}
      <Pricing/>
      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 sm:mt-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-slate-600">
          <p className="text-xs sm:text-sm flex justify-center items-center gap-2">
            Made with love by Angshu <Heart className='w-4 h-4 sm:w-5 sm:h-5 text-red-400 fill-red-400' />
          </p>
        </div>
      </footer>
    </div>
  );
}