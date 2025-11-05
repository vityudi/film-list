import { supabase } from './supabaseClient';

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

export async function signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Ensure user record is created in public.users table
    if (data.user?.id) {
      await createUserRecord(data.user.id, data.user.email || '');
    }

    return {
      success: true,
      user: {
        id: data.user?.id || '',
        email: data.user?.email || '',
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred during sign up',
    };
  }
}

export async function signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: {
        id: data.user?.id || '',
        email: data.user?.email || '',
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred during sign in',
    };
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred during sign out',
    };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  } catch (err) {
    return null;
  }
}

export function onAuthStateChange(
  callback: (user: { id: string; email: string } | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
      });
    } else {
      callback(null);
    }
  });

  return data.subscription;
}

async function createUserRecord(userId: string, email: string): Promise<void> {
  try {
    // Check if user record already exists
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!data) {
      // User record doesn't exist, create it
      const { error } = await supabase.from('users').insert([
        {
          id: userId,
          email: email,
        },
      ]);

      if (error) {
        console.error('Error creating user record:', error);
      }
    }
  } catch (err) {
    console.error('Error in createUserRecord:', err);
    // Don't throw, just log the error
  }
}
