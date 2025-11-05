'use client';

import Image from 'next/image';
import { useMovieDetailsModalStore } from '@/lib/utils/store';
import { tmdbClient } from '@/lib/services/tmdbClient';
import type { TMDBMovie } from '@/lib/services/tmdbClient';

interface MovieCardProps {
  movie: TMDBMovie;
  onFavoriteClick?: (movie: TMDBMovie) => void;
  isFavorite?: boolean;
}

export default function MovieCard({
  movie,
  onFavoriteClick,
  isFavorite = false,
}: MovieCardProps) {
  const posterUrl = tmdbClient.getImageUrl(movie.poster_path, 'w500');
  const { openModal } = useMovieDetailsModalStore();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking the favorite button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    openModal(movie.id);
  };

  return (
    <div
      className="relative group rounded-lg overflow-hidden bg-gray-900 cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Poster Image */}
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
          <div className="text-white space-y-2">
            <h3 className="font-bold text-sm line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★</span>
              <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        {onFavoriteClick && (
          <button
            onClick={() => onFavoriteClick(movie)}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all ${
              isFavorite
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-800 hover:bg-gray-700 bg-opacity-70'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5 text-white"
              fill={isFavorite ? 'currentColor' : 'none'}
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
        )}
      </div>
    </div>
  );
}
