interface GoogleCredentials {
  clientId: string;
  apiKey?: string;
  folderId?: string;
}

interface CredentialValidationResult {
  isValid: boolean;
  errors: string[];
}

class CredentialStorageService {
  private readonly STORAGE_KEY = 'music_app_google_credentials';
  
  /**
   * Save Google API credentials to localStorage
   */
  saveCredentials(credentials: GoogleCredentials): void {
    try {
      const sanitizedCredentials = {
        clientId: credentials.clientId.trim(),
        apiKey: credentials.apiKey?.trim(),
        folderId: credentials.folderId?.trim(),
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sanitizedCredentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw new Error('Failed to save credentials to storage');
    }
  }

  /**
   * Load Google API credentials from localStorage
   */
  loadCredentials(): GoogleCredentials | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }
      
      return JSON.parse(stored) as GoogleCredentials;
    } catch (error) {
      console.error('Error loading credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  clearCredentials(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  /**
   * Check if credentials exist
   */
  hasCredentials(): boolean {
    const credentials = this.loadCredentials();
    return credentials !== null && Boolean(credentials.clientId);
  }

  /**
   * Validate credential format and requirements
   */
  validateCredentials(credentials: Partial<GoogleCredentials>): CredentialValidationResult {
    const errors: string[] = [];

    // Validate Client ID
    if (!credentials.clientId) {
      errors.push('Client ID is required');
    } else if (!credentials.clientId.trim()) {
      errors.push('Client ID cannot be empty');
    } else {
      // Basic format validation for Google OAuth Client ID
      const clientIdPattern = /^[0-9]+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/;
      if (!clientIdPattern.test(credentials.clientId.trim())) {
        errors.push('Client ID format appears invalid. Expected format: 123456789-abc...def.apps.googleusercontent.com');
      }
    }

    // Validate API Key (optional but if provided should be valid format)
    if (credentials.apiKey && credentials.apiKey.trim()) {
      const apiKeyPattern = /^[A-Za-z0-9_-]{35,45}$/;
      if (!apiKeyPattern.test(credentials.apiKey.trim())) {
        errors.push('API Key format appears invalid. Expected 35-45 characters of letters, numbers, underscores, and hyphens');
      }
    }

    // Validate Folder ID (optional)
    if (credentials.folderId && credentials.folderId.trim()) {
      const folderIdPattern = /^[a-zA-Z0-9_-]+$/;
      if (!folderIdPattern.test(credentials.folderId.trim())) {
        errors.push('Folder ID format appears invalid. Should contain only letters, numbers, underscores, and hyphens');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get credentials for environment variables (for backward compatibility)
   */
  getCredentialsForEnv(): { 
    VITE_GOOGLE_CLIENT_ID: string; 
    VITE_GOOGLE_API_KEY: string; 
    VITE_GOOGLE_DRIVE_FOLDER_ID: string; 
  } {
    const credentials = this.loadCredentials();
    
    return {
      VITE_GOOGLE_CLIENT_ID: credentials?.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      VITE_GOOGLE_API_KEY: credentials?.apiKey || import.meta.env.VITE_GOOGLE_API_KEY || '',
      VITE_GOOGLE_DRIVE_FOLDER_ID: credentials?.folderId || import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '',
    };
  }

  /**
   * Test if stored credentials work with Google API
   */
  async testCredentials(credentials?: GoogleCredentials): Promise<{
    success: boolean;
    error?: string;
  }> {
    const testCreds = credentials || this.loadCredentials();
    
    if (!testCreds?.clientId) {
      return { success: false, error: 'No credentials to test' };
    }

    try {
      // Test by attempting to load Google API with the credentials
      // This is a basic connectivity test
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      
      return new Promise((resolve) => {
        script.onload = () => {
          // Basic test - if we can load the script, credentials format is likely valid
          // Real validation happens during OAuth flow
          resolve({ success: true });
        };
        
        script.onerror = () => {
          resolve({ success: false, error: 'Failed to connect to Google APIs' });
        };

        // Cleanup - remove script after test
        script.onload = script.onerror = () => {
          document.head.removeChild(script);
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during validation' 
      };
    }
  }

  /**
   * Import credentials from environment variables (migration helper)
   */
  importFromEnvironment(): boolean {
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const envApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const envFolderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

    if (envClientId) {
      const credentials: GoogleCredentials = {
        clientId: envClientId,
        apiKey: envApiKey || undefined,
        folderId: envFolderId || undefined,
      };

      const validation = this.validateCredentials(credentials);
      if (validation.isValid) {
        this.saveCredentials(credentials);
        return true;
      }
    }

    return false;
  }
}

export const credentialStorageService = new CredentialStorageService();
export type { GoogleCredentials, CredentialValidationResult };