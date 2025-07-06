'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '..//components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6">
      <div className={`text-center max-w-3xl w-full transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Your Path to Financial Peace
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-300">
          Effortlessly track, analyze, and master your money. Simple tools for a clear financial future.
        </p>
        <Button
          onClick={handleGetStarted}
          className="px-8 py-4 text-lg bg-stone-600 hover:bg-stone-700 rounded-full transition transform active:scale-95"
        >
          Get Started – It's Free!
        </Button>
      </div>
    </div>
  );
}
