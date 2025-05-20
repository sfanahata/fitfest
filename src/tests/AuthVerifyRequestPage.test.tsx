import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthVerifyRequestPage from '../app/auth/verify-request/page';

describe('AuthVerifyRequestPage', () => {
  it('renders verify request message', () => {
    render(<AuthVerifyRequestPage />);
    expect(screen.getByText(/A sign-in link has been sent/i)).toBeInTheDocument();
  });
}); 