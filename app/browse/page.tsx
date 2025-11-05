'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MovieRow from '@/components/MovieRow';
import MovieCard from '@/components/MovieCard';
import {
  usePopularMovies,
  useTopRatedMovies,
  useUpcomingMovies,
  useSearchMovies,
} from '@/lib/hooks/useMovies';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import type { TMDBMovie } from '@/lib/services/tmdbClient';

export default function BrowsePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    movies: popularMovies,
    loading: popularLoading,
  } = usePopularMovies();
  const {
    movies: topRatedMovies,
    loading: topRatedLoading,
  } = useTopRatedMovies();
  const {
    movies: upcomingMovies,
    loading: upcomingLoading,
  } = useUpcomingMovies();

  const { movies: searchResults, loading: searchLoading, searchMovies } = useSearchMovies();

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  // If no user, show nothing (will redirect via useEffect)
  if (!user) {
    return null;
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setIsSearching(true);
      searchMovies(query);
    } else {
      setSearchQuery('');
      setIsSearching(false);
    }
  };

  const handleFavoriteClick = (movie: TMDBMovie) => {
    const isFav = isFavorite(movie.id);
    if (isFav) {
      removeFavorite(movie.id);
    } else {
      addFavorite({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        genreIds: movie.genre_ids,
      });
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <Header user={null} onSearch={handleSearch} />

      <main className="pt-16 pb-8">
        {isSearching ? (
          // Search Results View
          <div className="px-4 md:px-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Search Results for "{searchQuery}"
            </h1>
            <p className="text-gray-400 mb-8">
              {searchResults.length > 0
                ? `Found ${searchResults.length} movies`
                : 'No movies found'}
            </p>

            {searchLoading && <div className="text-gray-400">Searching...</div>}

            {!searchLoading && searchResults.length === 0 && (
              <div className="text-gray-400 py-12 text-center">
                No movies found for "{searchQuery}". Try a different search.
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.id}>
                    <MovieCard
                      movie={movie}
                      onFavoriteClick={handleFavoriteClick}
                      isFavorite={isFavorite(movie.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Back button */}
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
              className="mt-8 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Back to Browse
            </button>
          </div>
        ) : (
          // Default Browse View
          <>
            {/* Popular Section */}
            {popularLoading ? (
              <div className="px-8 py-6 text-gray-400">Loading popular movies...</div>
            ) : (
              <MovieRow
                title="Popular Now"
                movies={popularMovies}
                onFavoriteClick={handleFavoriteClick}
                isFavorite={isFavorite}
              />
            )}

            {/* Top Rated Section */}
            {topRatedLoading ? (
              <div className="px-8 py-6 text-gray-400">Loading top rated movies...</div>
            ) : (
              <MovieRow
                title="Top Rated"
                movies={topRatedMovies}
                onFavoriteClick={handleFavoriteClick}
                isFavorite={isFavorite}
              />
            )}

            {/* Upcoming Section */}
            {upcomingLoading ? (
              <div className="px-8 py-6 text-gray-400">Loading upcoming movies...</div>
            ) : (
              <MovieRow
                title="Coming Soon"
                movies={upcomingMovies}
                onFavoriteClick={handleFavoriteClick}
                isFavorite={isFavorite}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
