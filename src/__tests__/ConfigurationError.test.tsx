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

  it('should call onRetry when retry button is clicked', () => {
    const mockRetry = vi.fn();
    const error = 'Google OAuth configuration is missing';
    
    render(<ConfigurationError error={error} onRetry={mockRetry} />);
    
    const retryButton = screen.getByText('Retry Configuration');
    retryButton.click();
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});