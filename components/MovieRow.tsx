'use client';

import { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import type { TMDBMovie } from '@/lib/services/tmdbClient';

interface MovieRowProps {
  title: string;
  movies: TMDBMovie[];
  onFavoriteClick?: (movie: TMDBMovie) => void;
  isFavorite?: (movieId: number) => boolean;
}

export default function MovieRow({
  title,
  movies,
  onFavoriteClick,
  isFavorite = () => false,
}: MovieRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 500;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(() => {
        if (scrollContainerRef.current) {
          setShowLeftArrow(scrollContainerRef.current.scrollLeft > 0);
          setShowRightArrow(
            scrollContainerRef.current.scrollLeft <
              scrollContainerRef.current.scrollWidth -
                scrollContainerRef.current.clientWidth
          );
        }
      }, 300);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowLeftArrow(scrollContainerRef.current.scrollLeft > 0);
      setShowRightArrow(
        scrollContainerRef.current.scrollLeft <
          scrollContainerRef.current.scrollWidth -
            scrollContainerRef.current.clientWidth
      );
    }
  };

  return (
    <div className="px-4 md:px-8 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h2>

      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Movies Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-32 md:w-40">
              <MovieCard
                movie={movie}
                onFavoriteClick={onFavoriteClick}
                isFavorite={isFavorite(movie.id)}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
