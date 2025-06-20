import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthSignInPage from '../app/auth/signin/page';
import { signIn } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('AuthSignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign-in form with email input and submit button', () => {
    render(<AuthSignInPage />);
    
    expect(screen.getByText('Sign in to FitFest')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument();
  });

  it('calls signIn with correct callbackUrl when form is submitted', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    
    render(<AuthSignInPage />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getRole('button', { name: /sign in with email/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('email', {
        email: 'test@example.com',
        callbackUrl: '/',
      });
    });
  });

  it('shows loading state and success message after form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    
    render(<AuthSignInPage />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getRole('button', { name: /sign in with email/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText(/if your email is registered, you'll receive a magic link shortly/i)).toBeInTheDocument();
    });
  });

  it('shows error messages', () => {
    // TODO: Mock error and test error display
  });
}); 