'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMovieDetailsModalStore } from '@/lib/utils/store';
import { tmdbClient } from '@/lib/services/tmdbClient';
import { useFavorites } from '@/lib/hooks/useFavorites';
import type { TMDBMovieDetails } from '@/lib/services/tmdbClient';

export default function MovieDetailsModal() {
  const { isOpen, movieId, closeModal } = useMovieDetailsModalStore();
  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    if (isOpen && movieId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const details = await tmdbClient.getMovieDetails(movieId);
          setMovieDetails(details);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
          console.error('Error fetching movie details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, movieId]);

  // Handle Escape key to close modal and prevent body scroll when modal is open
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscapeKey);
      return () => {
        window.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleToggleFavorite = async () => {
    if (!movieDetails) return;

    const movieData = {
      id: movieDetails.id,
      title: movieDetails.title,
      posterPath: movieDetails.poster_path,
      backdropPath: movieDetails.backdrop_path,
      overview: movieDetails.overview,
      releaseDate: movieDetails.release_date,
      voteAverage: movieDetails.vote_average,
      voteCount: movieDetails.vote_count,
      genreIds: movieDetails.genre_ids,
    };

    if (isFavorite(movieDetails.id)) {
      await removeFavorite(movieDetails.id);
    } else {
      await addFavorite(movieData);
    }
  };

  const formatCurrency = (value: number) => {
    if (value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl my-8 overflow-hidden shadow-2xl">
        {/* Backdrop Image */}
        {movieDetails?.backdrop_path && (
          <div className="relative h-60 md:h-80 w-full">
            <Image
              src={tmdbClient.getImageUrl(movieDetails.backdrop_path, 'original')}
              alt={movieDetails.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {/* Movie Details */}
          {movieDetails && (
            <>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-32 md:w-48">
                  <Image
                    src={tmdbClient.getImageUrl(movieDetails.poster_path, 'w500')}
                    alt={movieDetails.title}
                    width={200}
                    height={300}
                    className="rounded-lg w-full h-auto"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {movieDetails.title}
                      </h2>
                      {movieDetails.tagline && (
                        <p className="text-gray-400 italic text-lg">
                          "{movieDetails.tagline}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex-shrink-0 p-3 rounded-full transition-all h-fit ${
                        isFavorite(movieDetails.id)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      aria-label={
                        isFavorite(movieDetails.id)
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill={isFavorite(movieDetails.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Rating and Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xl">★</span>
                        <span className="text-white text-lg font-semibold">
                          {movieDetails.vote_average.toFixed(1)}/10
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        ({movieDetails.vote_count.toLocaleString()} votes)
                      </p>
                    </div>

                    {movieDetails.runtime && (
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-gray-400 text-sm mb-1">Runtime</p>
                        <p className="text-white text-lg font-semibold">
                          {formatRuntime(movieDetails.runtime)}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-gray-400 text-sm mb-1">Release Date</p>
                      <p className="text-white text-lg font-semibold">
                        {new Date(movieDetails.release_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Genres */}
                  {movieDetails.genres && movieDetails.genres.length > 0 && (
                    <div className="mb-6">
                      <p className="text-gray-400 text-sm mb-2">Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="bg-red-600 bg-opacity-20 border border-red-600 text-red-400 px-3 py-1 rounded-full text-sm"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {movieDetails.overview || 'No overview available.'}
                </p>
              </div>

              {/* Budget and Revenue */}
              {(movieDetails.budget > 0 || movieDetails.revenue > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {movieDetails.budget > 0 && (
                    <div className="bg-gray-800 p-4 rounded">
                      <p className="text-gray-400 text-sm mb-2">Budget</p>
                      <p className="text-white text-lg font-semibold">
                        {formatCurrency(movieDetails.budget)}
                      </p>
                    </div>
                  )}
                  {movieDetails.revenue > 0 && (
                    <div className="bg-gray-800 p-4 rounded">
                      <p className="text-gray-400 text-sm mb-2">Revenue</p>
                      <p className="text-white text-lg font-semibold">
                        {formatCurrency(movieDetails.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              {movieDetails.status && (
                <div className="bg-gray-800 p-3 rounded mb-6">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className="text-white">{movieDetails.status}</p>
                </div>
              )}

              {/* IMDb Link */}
              {movieDetails.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movieDetails.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded transition-colors"
                >
                  View on IMDb
                </a>
              )}
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
