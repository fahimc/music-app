import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types';
import { googleAuthService } from '../services/googleAuth';
import { credentialStorageService } from '../services/credentialStorage';

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  reinitialize: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    error: null,
  });

  useEffect(() => {
    // Initialize Google API and check for existing auth
    const initAuth = async () => {
      try {
        // First try to import credentials from environment if available
        if (!credentialStorageService.hasCredentials()) {
          credentialStorageService.importFromEnvironment();
        }

        // Check if we have credentials before trying to initialize
        if (!credentialStorageService.hasCredentials()) {
          // No credentials available - set to not authenticated without error
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
            error: null,
          });
          return;
        }

        // Initialize Google Auth with stored credentials
        await googleAuthService.init();
        const isSignedIn = googleAuthService.isSignedIn();
        
        if (isSignedIn) {
          const user = googleAuthService.getCurrentUser();
          const accessToken = googleAuthService.getAccessToken();
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            accessToken,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Set error for authentication issues
        const errorMessage = error instanceof Error ? error.message : 'Authentication initialization failed';
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          accessToken: null,
          error: errorMessage,
        });
      }
    };

    initAuth();
  }, []);

  const signIn = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await googleAuthService.signIn();
      const user = googleAuthService.getCurrentUser();
      const accessToken = googleAuthService.getAccessToken();
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken,
        error: null,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: error instanceof Error ? error.message : 'Sign in failed',
      });
    }
  };

  const signOut = async () => {
    try {
      await googleAuthService.signOut();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  };

  const refreshToken = async () => {
    try {
      await googleAuthService.refreshToken();
      const accessToken = googleAuthService.getAccessToken();
      
      setAuthState(prev => ({
        ...prev,
        accessToken,
        error: null,
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      // If token refresh fails, sign out the user
      await signOut();
    }
  };

  const reinitialize = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await googleAuthService.reinitialize();
      const isSignedIn = googleAuthService.isSignedIn();
      
      if (isSignedIn) {
        const user = googleAuthService.getCurrentUser();
        const accessToken = googleAuthService.getAccessToken();
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          accessToken,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          accessToken: null,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth reinitialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication reinitialization failed';
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: errorMessage,
      });
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshToken,
    reinitialize,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};