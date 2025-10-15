import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigurationError } from '../components/ConfigurationError';

describe('ConfigurationError', () => {
  it('should render configuration instructions when configuration error occurs', () => {
    const error = 'Google OAuth configuration is missing. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.';
    
    render(<ConfigurationError error={error} />);
    
    expect(screen.getByText('Google API Configuration Required')).toBeInTheDocument();
    expect(screen.getByText('Setup Instructions')).toBeInTheDocument();
    expect(screen.getByText('1. Create Google Cloud Project')).toBeInTheDocument();
  });

  it('should render simple error for non-configuration errors', () => {
    const error = 'Network error occurred';
    
    render(<ConfigurationError error={error} />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('should render simple error for authorization origin errors', () => {
    const error = 'Authorization Origin Error: The current origin "http://localhost:5173" is not authorized for your Google OAuth Client ID.';
    
    render(<ConfigurationError error={error} />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText(/Authorization Origin Error/)).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked for configuration error', () => {
    const mockRetry = vi.fn();
    const error = 'Google OAuth configuration is missing';
    
    render(<ConfigurationError error={error} onRetry={mockRetry} />);
    
    const retryButton = screen.getByText('Retry');
    retryButton.click();
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry when retry button is clicked for non-configuration error', () => {
    const mockRetry = vi.fn();
    const error = 'Network error occurred';
    
    render(<ConfigurationError error={error} onRetry={mockRetry} />);
    
    const retryButton = screen.getByText('Retry');
    retryButton.click();
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});