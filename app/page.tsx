'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';

type AuthMode = 'login' | 'signup';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Auto-redirect to browse if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/browse');
    }
  }, [user, router]);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Header */}
      <div className="py-6 px-4 text-center border-b border-gray-800">
        <h1 className="text-4xl font-bold text-red-600">FILMLIST</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Your Next Favorite Movie
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Browse thousands of movies, build your personalized watchlist, and find your next binge-watch
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-2xl">🎬</span>
                <div>
                  <h3 className="text-white font-semibold">Browse Movies</h3>
                  <p className="text-gray-400 text-sm">Popular, top-rated, and upcoming films</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">❤️</span>
                <div>
                  <h3 className="text-white font-semibold">Save Favorites</h3>
                  <p className="text-gray-400 text-sm">Keep track of movies you want to watch</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="text-white font-semibold">Search Instantly</h3>
                  <p className="text-gray-400 text-sm">Find any movie in seconds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="bg-gray-900 rounded-lg p-8">
            {authMode === 'login' ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Sign In</h3>
                <LoginForm
                  onSuccess={() => router.push('/browse')}
                  onSwitchToSignUp={() => setAuthMode('signup')}
                />
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Create Account</h3>
                <SignUpForm
                  onSuccess={() => router.push('/browse')}
                  onSwitchToLogin={() => setAuthMode('login')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
