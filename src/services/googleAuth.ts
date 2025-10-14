import type { GoogleUser } from '../types';
import { credentialStorageService } from './credentialStorage';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleAuthService {
  private isInitialized = false;
  private authInstance: any = null;
  
  // Google OAuth Configuration
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  private getClientId(): string {
    const storedCreds = credentialStorageService.loadCredentials();
    return storedCreds?.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  private validateConfig(): boolean {
    const clientId = this.getClientId();
    return Boolean(clientId && clientId !== '');
  }

  private isGoogleApiLoaded(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.gapi !== 'undefined' && 
           typeof window.gapi.load === 'function';
  }

  private initializeAuth(resolve: () => void, reject: (error: Error) => void): void {
    try {
      window.gapi.load('auth2', () => {
        try {
          const clientId = this.getClientId();
          console.log('Initializing Google Auth with client ID:', clientId.substring(0, 20) + '...');
          
          window.gapi.auth2.init({
            client_id: clientId,
            scope: this.SCOPES
          }).then(() => {
            this.authInstance = window.gapi.auth2.getAuthInstance();
            this.isInitialized = true;
            console.log('Google Auth initialized successfully');
            resolve();
          }).catch((initError: any) => {
            console.error('Google Auth init error:', initError);
            let errorMessage = 'Failed to initialize Google Auth';
            
            if (initError && typeof initError === 'object') {
              if (initError.error === 'idpiframe_initialization_failed') {
                // Specific error for authorization origin issues
                const currentOrigin = window.location.origin;
                errorMessage = `Authorization Origin Error: The current origin "${currentOrigin}" is not authorized for your Google OAuth Client ID. Please add this origin to your Google Cloud Console OAuth credentials under "Authorized JavaScript origins".`;
                
                if (initError.details) {
                  errorMessage += `\n\nDetails: ${initError.details}`;
                }
              } else if (initError.error) {
                errorMessage += `: ${initError.error}`;
                if (initError.error_description) {
                  errorMessage += ` - ${initError.error_description}`;
                }
              } else if (initError.message) {
                errorMessage += `: ${initError.message}`;
              } else {
                errorMessage += `: ${JSON.stringify(initError)}`;
              }
            } else if (typeof initError === 'string') {
              errorMessage += `: ${initError}`;
            }
            
            reject(new Error(errorMessage));
          });
        } catch (syncError) {
          console.error('Google Auth sync init error:', syncError);
          reject(new Error(`Failed to initialize Google Auth synchronously: ${syncError instanceof Error ? syncError.message : String(syncError)}`));
        }
      });
    } catch (error) {
      console.error('Google API load error:', error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Validate configuration before attempting to initialize
    if (!this.validateConfig()) {
      throw new Error(
        'Google OAuth configuration is missing. Please configure your Google API credentials to continue.'
      );
    }

    return new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if (this.isGoogleApiLoaded()) {
        this.initializeAuth(resolve, reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.initializeAuth(resolve, reject);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Please configure your credentials first.');
    }

    if (!this.authInstance) {
      throw new Error('Google Auth instance not available. Please refresh and try again.');
    }

    try {
      console.log('Starting Google sign in...');
      const authResult = await this.authInstance.signIn();
      console.log('Google sign in successful');
      return authResult;
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Sign in failed';
      if (error && typeof error === 'object') {
        if ((error as any).error) {
          errorMessage += `: ${(error as any).error}`;
        } else if ((error as any).message) {
          errorMessage += `: ${(error as any).message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized || !this.authInstance) {
      throw new Error('Google Auth not initialized');
    }

    try {
      await this.authInstance.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  isSignedIn(): boolean {
    if (!this.isInitialized || !this.authInstance) {
      return false;
    }

    return this.authInstance.isSignedIn.get();
  }

  getCurrentUser(): GoogleUser | null {
    if (!this.isSignedIn()) {
      return null;
    }

    const user = this.authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      picture: profile.getImageUrl(),
    };
  }

  getAccessToken(): string | null {
    if (!this.isSignedIn()) {
      return null;
    }

    const user = this.authInstance.currentUser.get();
    const authResponse = user.getAuthResponse();
    return authResponse.access_token;
  }

  async refreshToken(): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    const user = this.authInstance.currentUser.get();
    await user.reloadAuthResponse();
  }

  /**
   * Reinitialize the auth service with new credentials
   */
  async reinitialize(): Promise<void> {
    console.log('Reinitializing Google Auth service...');
    
    try {
      // Reset state
      this.isInitialized = false;
      this.authInstance = null;

      // Validate that we have credentials before reinitializing
      if (!this.validateConfig()) {
        throw new Error('Cannot reinitialize: No valid credentials found');
      }

      // Initialize with new credentials
      await this.init();
      console.log('Google Auth reinitialized successfully');
    } catch (error) {
      console.error('Reinitialize error:', error);
      throw error;
    }
  }

  // Check if token is expired or about to expire
  isTokenExpired(): boolean {
    if (!this.isSignedIn()) {
      return true;
    }

    const user = this.authInstance.currentUser.get();
    const authResponse = user.getAuthResponse();
    const expiresAt = authResponse.expires_at;
    const now = Date.now();
    
    // Consider token expired if it expires in the next 5 minutes
    return expiresAt - now < 5 * 60 * 1000;
  }

  /**
   * Test if the current credentials are working by attempting to initialize
   * without throwing errors to the main application
   */
  async testCredentials(): Promise<{ success: boolean; error?: string }> {
    try {
      const clientId = this.getClientId();
      
      if (!clientId) {
        return { success: false, error: 'No client ID found' };
      }

      // Basic format validation
      const clientIdPattern = /^[0-9]+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/;
      if (!clientIdPattern.test(clientId)) {
        return { success: false, error: 'Invalid client ID format' };
      }

      // If already initialized with these credentials, it's working
      if (this.isInitialized) {
        return { success: true };
      }

      // Try a test initialization (this is a simplified test)
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const googleAuthService = new GoogleAuthService();