import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Utilitários de teste e auxiliares para o projeto film-list
 */

/**
 * Dados de filme de amostra para testes
 */
export const mockMovieData = {
  basic: {
    id: 550,
    title: 'Fight Club',
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    overview: 'Um trabalhador de escritório insone e um fabricante de sabão despreocupado formam um clube de luta clandestino.',
    releaseDate: '1999-10-15',
    voteAverage: 8.8,
    voteCount: 25000,
    genreIds: [18, 53],
  },
  alternative: {
    id: 551,
    title: 'Se7en',
    posterPath: '/poster2.jpg',
    backdropPath: '/backdrop2.jpg',
    overview: 'Dois detetives caçam um assassino em série que usa os sete pecados capitais como motivos.',
    releaseDate: '1995-09-22',
    voteAverage: 8.6,
    voteCount: 20000,
    genreIds: [18, 53, 80],
  },
  lowRated: {
    id: 999,
    title: 'Filme com Baixa Classificação',
    posterPath: null,
    backdropPath: null,
    overview: 'Um filme mal recebido',
    releaseDate: '2020-01-01',
    voteAverage: 3.2,
    voteCount: 100,
    genreIds: [],
  },
};

/**
 * Dados de usuário de amostra para testes
 */
export const mockUserData = {
  authenticated: {
    id: 'user-123',
    email: 'test@example.com',
  },
  alternative: {
    id: 'user-456',
    email: 'another@example.com',
  },
};

/**
 * Criar uma resposta mock do Supabase
 */
export const createMockSupabaseResponse = <T,>(
  data: T | null = null,
  error: any = null
) => ({
  data,
  error,
});

/**
 * Criar uma assinatura mock de autenticação
 */
export const createMockAuthSubscription = () => ({
  unsubscribe: vi.fn(),
});

/**
 * Aguardar operações assíncronas em testes
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Criar dados mock de notificação
 */
export const mockNotificationData = {
  success: {
    message: 'Operação bem-sucedida',
    type: 'success' as const,
  },
  error: {
    message: 'Operação falhou',
    type: 'error' as const,
  },
  info: {
    message: 'Informação',
    type: 'info' as const,
  },
};

/**
 * Função de renderização personalizada com provedores se necessário
 * Atualmente apenas envolve a renderização padrão, mas pronta para futuras adições de provedor
 */
export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Afirmar que uma função foi chamada com argumentos específicos
 */
export const expectCalledWith = (
  mockFn: any,
  expectedArgs: any[]
) => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

/**
 * Criar um espião em métodos do console para testar saída de erro/aviso
 */
export const createConsoleSpy = (method: 'log' | 'error' | 'warn' = 'log') => {
  return vi.spyOn(console, method).mockImplementation(() => {});
};

/**
 * Auxiliares de verificação
 */
export const assertions = {
  isMovie: (obj: any) => {
    expect(obj).toHaveProperty('id');
    expect(obj).toHaveProperty('title');
    expect(obj).toHaveProperty('releaseDate');
    expect(typeof obj.id).toBe('number');
    expect(typeof obj.title).toBe('string');
  },

  isUser: (obj: any) => {
    expect(obj).toHaveProperty('id');
    expect(obj).toHaveProperty('email');
    expect(typeof obj.id).toBe('string');
    expect(typeof obj.email).toBe('string');
  },

  isSuccessResponse: (obj: any) => {
    expect(obj).toHaveProperty('success', true);
    expect(obj).not.toHaveProperty('error');
  },

  isErrorResponse: (obj: any) => {
    expect(obj).toHaveProperty('success', false);
    expect(obj).toHaveProperty('error');
    expect(typeof obj.error).toBe('string');
  },
};
