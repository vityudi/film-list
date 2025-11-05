export interface Movie {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  tagline: string | null;
  status: string;
  imdbId: string | null;
}

export interface UserFavorite {
  id: string;
  userId: string;
  movieId: number;
  movieData: Movie;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
