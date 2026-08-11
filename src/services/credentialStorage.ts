interface GoogleCredentials {
  clientId: string;
  apiKey?: string;
  folderId?: string;
  folderName?: string;
}

interface CredentialValidationResult {
  isValid: boolean;
  errors: string[];
}

class CredentialStorageService {
  private readonly STORAGE_KEY = 'music_app_google_credentials';
  private readonly FOLDER_STORAGE_KEY = 'music_app_google_folder';

  /**
   * Save the user's Drive music folder selection. Stored independently of
   * OAuth credentials so it persists in central mode (where the Client ID
   * comes from the build and nothing is written to credential storage).
   */
  saveFolder(folderId: string, folderName: string): void {
    try {
      localStorage.setItem(this.FOLDER_STORAGE_KEY, JSON.stringify({ folderId, folderName }));
    } catch (error) {
      console.error('Error saving folder:', error);
    }
  }

  /**
   * Load the user's Drive music folder selection, falling back to the folder
   * stored inside legacy credentials for users who set it up before folders
   * were stored separately.
   */
  loadFolder(): { folderId?: string; folderName?: string } | null {
    try {
      const stored = localStorage.getItem(this.FOLDER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as { folderId?: string; folderName?: string };
      }
      const credentials = this.loadCredentials();
      if (credentials?.folderId) {
        return { folderId: credentials.folderId, folderName: credentials.folderName };
      }
      return null;
    } catch (error) {
      console.error('Error loading folder:', error);
      return null;
    }
  }

  /**
   * Clear the stored Drive folder selection.
   */
  clearFolder(): void {
    try {
      localStorage.removeItem(this.FOLDER_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing folder:', error);
    }
  }
  
  /**
   * Save Google API credentials to localStorage
   */
  saveCredentials(credentials: GoogleCredentials): void {
    try {
      const sanitizedCredentials = {
        clientId: credentials.clientId.trim(),
        apiKey: credentials.apiKey?.trim(),
        folderId: credentials.folderId?.trim(),
        folderName: credentials.folderName?.trim(),
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
   * Effective Client ID in use: a user-provided override (stored) takes
   * precedence, otherwise the app's built-in Client ID baked in at build
   * time via VITE_GOOGLE_CLIENT_ID. Empty string means neither is set.
   */
  getClientId(): string {
    const stored = this.loadCredentials();
    if (stored?.clientId) {
      return stored.clientId;
    }
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  /**
   * True when a usable Client ID is available (user override or built-in).
   */
  isConfigured(): boolean {
    return Boolean(this.getClientId());
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