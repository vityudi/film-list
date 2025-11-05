import axios, { AxiosInstance } from 'axios';

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class TMDBClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
    this.baseURL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        api_key: this.apiKey,
      },
    });
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const response = await this.client.get('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const response = await this.client.get('/movie/top_rated', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const response = await this.client.get('/movie/upcoming', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      throw error;
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    try {
      const response = await this.client.get('/search/movie', {
        params: {
          query,
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  async getMovieDetails(movieId: number) {
    try {
      const response = await this.client.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  }

  getImageUrl(path: string | null, size: 'w300' | 'w500' | 'original' = 'w500'): string {
    if (!path) {
      return '/images/placeholder.jpg';
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbClient = new TMDBClient();
export type { TMDBMovie, TMDBResponse };
