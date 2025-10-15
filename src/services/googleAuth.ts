import type { GoogleUser } from '../types';
import { credentialStorageService } from './credentialStorage';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

class GoogleAuthService {
  private isInitialized = false;
  private tokenClient: any = null;
  private currentUser: GoogleUser | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  // Storage keys
  private readonly AUTH_STATE_KEY = 'music_app_auth_state';
  private readonly USER_KEY = 'music_app_user';
  private readonly TOKEN_KEY = 'music_app_token';
  private readonly TOKEN_EXPIRY_KEY = 'music_app_token_expiry';
  
  // Google OAuth Configuration
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  constructor() {
    // Load persisted auth state on initialization
    this.loadPersistedAuthState();
  }

  private loadPersistedAuthState(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      const user = localStorage.getItem(this.USER_KEY);

      if (token && expiry && user) {
        const expiryTime = parseInt(expiry, 10);
        // Only restore if token hasn't expired
        if (expiryTime > Date.now()) {
          this.accessToken = token;
          this.tokenExpiry = expiryTime;
          this.currentUser = JSON.parse(user);
          console.log('Restored persisted auth state');
        } else {
          console.log('Persisted token expired, clearing');
          this.clearPersistedAuthState();
        }
      }
    } catch (error) {
      console.error('Error loading persisted auth state:', error);
      this.clearPersistedAuthState();
    }
  }

  private persistAuthState(): void {
    try {
      if (this.accessToken && this.currentUser) {
        localStorage.setItem(this.TOKEN_KEY, this.accessToken);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, this.tokenExpiry.toString());
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
        console.log('Persisted auth state');
      }
    } catch (error) {
      console.error('Error persisting auth state:', error);
    }
  }

  private clearPersistedAuthState(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('Cleared persisted auth state');
    } catch (error) {
      console.error('Error clearing persisted auth state:', error);
    }
  }

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
           typeof window.google !== 'undefined' && 
           typeof window.google.accounts !== 'undefined';
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isGoogleApiLoaded()) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services:', error);
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  private initializeTokenClient(resolve: () => void, reject: (error: Error) => void): void {
    try {
      const clientId = this.getClientId();
      console.log('Initializing Google Identity Services with client ID:', clientId.substring(0, 20) + '...');
      
      // Initialize the token client with the new Google Identity Services
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: this.SCOPES,
        callback: async (response: TokenResponse) => {
          if (response.error) {
            console.error('Token client error:', response.error);
            return;
          }
          this.accessToken = response.access_token;
          this.tokenExpiry = Date.now() + (response.expires_in * 1000);
          
          // Load user info asynchronously
          try {
            await this.loadUserInfo();
          } catch (error) {
            console.error('Failed to load user info in callback:', error);
            // Don't fail initialization if user info fails
          }
        },
      });

      this.isInitialized = true;
      console.log('Google Identity Services initialized successfully');
      resolve();
    } catch (error) {
      console.error('Token client initialization error:', error);
      
      let errorMessage = 'Failed to initialize Google Identity Services';
      
      if (error && typeof error === 'object') {
        if ((error as any).message) {
          errorMessage += `: ${(error as any).message}`;
        } else {
          errorMessage += `: ${JSON.stringify(error)}`;
        }
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      
      reject(new Error(errorMessage));
    }
  }

  private async loadUserInfo(): Promise<void> {
    if (!this.accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture,
        };
        // Persist auth state after loading user info
        this.persistAuthState();
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
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

    try {
      await this.loadGoogleIdentityServices();
      
      return new Promise((resolve, reject) => {
        // Wait a bit for the library to be fully ready
        setTimeout(() => {
          this.initializeTokenClient(resolve, reject);
        }, 100);
      });
    } catch (error) {
      console.error('Google Identity Services initialization error:', error);
      throw error;
    }
  }

  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Please configure your credentials first.');
    }

    if (!this.tokenClient) {
      throw new Error('Google Auth token client not available. Please refresh and try again.');
    }

    try {
      console.log('Starting Google sign in...');
      
      // Request an access token
      return new Promise((resolve, reject) => {
        // Store the callbacks temporarily
        const originalCallback = this.tokenClient.callback;
        
        this.tokenClient.callback = async (response: TokenResponse) => {
          if (response.error) {
            this.tokenClient.callback = originalCallback;
            reject(new Error(`Sign in failed: ${response.error}`));
            return;
          }
          
          try {
            this.accessToken = response.access_token;
            this.tokenExpiry = Date.now() + (response.expires_in * 1000);
            
            // Wait for user info to load
            await this.loadUserInfo();
            
            // Persist auth state after successful sign in
            this.persistAuthState();
            
            this.tokenClient.callback = originalCallback;
            console.log('Google sign in successful');
            resolve();
          } catch (error) {
            this.tokenClient.callback = originalCallback;
            console.error('Error during sign in completion:', error);
            reject(error);
          }
        };
        
        // Request access token - this will show the Google sign-in popup
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
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
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized');
    }

    try {
      // Revoke the token
      if (this.accessToken) {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('Token revoked');
        });
      }
      
      this.currentUser = null;
      this.accessToken = null;
      this.tokenExpiry = 0;
      
      // Clear persisted auth state
      this.clearPersistedAuthState();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  isSignedIn(): boolean {
    return Boolean(this.accessToken && this.tokenExpiry > Date.now());
  }

  getCurrentUser(): GoogleUser | null {
    return this.isSignedIn() ? this.currentUser : null;
  }

  getAccessToken(): string | null {
    return this.isSignedIn() ? this.accessToken : null;
  }

  async refreshToken(): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    if (!this.tokenClient) {
      throw new Error('Token client not available');
    }

    // Request a new token
    return new Promise((resolve, reject) => {
      const originalCallback = this.tokenClient.callback;
      
      this.tokenClient.callback = (response: TokenResponse) => {
        if (response.error) {
          this.tokenClient.callback = originalCallback;
          reject(new Error(`Token refresh failed: ${response.error}`));
          return;
        }
        
        this.accessToken = response.access_token;
        this.tokenExpiry = Date.now() + (response.expires_in * 1000);
        
        // Persist updated auth state
        this.persistAuthState();
        
        this.tokenClient.callback = originalCallback;
        resolve();
      };
      
      this.tokenClient.requestAccessToken({ prompt: '' });
    });
  }

  /**
   * Reinitialize the auth service with new credentials
   */
  async reinitialize(): Promise<void> {
    console.log('Reinitializing Google Auth service...');
    
    try {
      // Reset state
      this.isInitialized = false;
      this.tokenClient = null;
      this.currentUser = null;
      this.accessToken = null;
      this.tokenExpiry = 0;

      // Validate that we have credentials before reinitializing
      if (!this.validateConfig()) {
        throw new Error('Cannot reinitialize: No valid credentials found');
      }

      // Initialize with new credentials
      await this.init();
      console.log('Google Auth reinitialized successfully');
    } catch (error) {
      console.error('Reinitialize error:', error);
      
      // Preserve the original error message format for authorization errors
      if (error instanceof Error && error.message.includes('Authorization Origin Error')) {
        throw error;
      }
      
      // For other errors, wrap them in a reinitialization context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`reinitialization error: ${errorMessage}`);
    }
  }

  // Check if token is expired or about to expire
  isTokenExpired(): boolean {
    return !this.isSignedIn() || this.tokenExpiry <= Date.now();
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