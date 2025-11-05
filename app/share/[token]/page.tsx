'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import MovieCard from '@/components/MovieCard';
import { getSharedList } from '@/lib/services/shareService';
import { useMovieDetailsModalStore } from '@/lib/utils/store';
import type { Movie } from '@/lib/types';

interface SharePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const [token, setToken] = useState<string>('');
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openModal } = useMovieDetailsModalStore();

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        // Await the params promise
        const resolvedParams = await params;
        setToken(resolvedParams.token);
      } catch (err) {
        setError('Failed to load share page');
        setLoading(false);
      }
    };

    initializeAndFetch();
  }, [params]);

  useEffect(() => {
    const fetchSharedList = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getSharedList(token);
        if (!data) {
          setError('Share link not found or has expired');
          setFavorites([]);
        } else {
          setFavorites(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared list');
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [token]);

  const handleMovieClick = (movieId: number) => {
    openModal(movieId);
  };

  return (
    <div className="bg-black min-h-screen">
      <Header onSearch={() => {}} />

      <main className="pt-20 pb-8">
        <div className="px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 p-6 rounded-lg max-w-md mx-auto mb-6">
                <h2 className="text-xl font-bold mb-2">Share Link Invalid</h2>
                <p>{error}</p>
              </div>
              <Link
                href="/browse"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-6">This shared list is empty</p>
              <Link
                href="/browse"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Shared Favorites</h1>
                <p className="text-gray-400">
                  {favorites.length} favorite{favorites.length !== 1 ? 's' : ''} shared with you
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favorites.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleMovieClick(movie.id)}
                    className="cursor-pointer"
                  >
                    <MovieCard
                      movie={{
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.posterPath,
                        backdrop_path: movie.backdropPath,
                        overview: movie.overview,
                        release_date: movie.releaseDate,
                        vote_average: movie.voteAverage,
                        vote_count: movie.voteCount,
                        genre_ids: movie.genreIds,
                      }}
                      isFavorite={false}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-400 mb-4">Want to add these to your favorites?</p>
                <Link
                  href="/browse"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
                >
                  Browse & Create Your Own
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
