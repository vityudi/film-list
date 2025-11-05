import { useState, useCallback, useEffect } from 'react';
import { tmdbClient, type TMDBMovie, type TMDBResponse } from '@/lib/services/tmdbClient';

interface UseMoviesReturn {
  movies: TMDBMovie[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

export function usePopularMovies(): UseMoviesReturn {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tmdbClient.getPopularMovies(page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, totalPages, currentPage };
}

export function useTopRatedMovies(): UseMoviesReturn {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tmdbClient.getTopRatedMovies(page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, totalPages, currentPage };
}

export function useUpcomingMovies(): UseMoviesReturn {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tmdbClient.getUpcomingMovies(page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, totalPages, currentPage };
}

export function useSearchMovies() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const searchMovies = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await tmdbClient.searchMovies(query, page);
      setMovies(response.results);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search movies');
    } finally {
      setLoading(false);
    }
  }, []);

  return { movies, loading, error, searchMovies, totalPages, currentPage };
}
