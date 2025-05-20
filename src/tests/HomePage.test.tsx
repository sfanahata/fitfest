import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />);
    expect(screen.getByText(/Welcome to FitFest/i)).toBeInTheDocument();
  });

  it('shows session-based content', () => {
    // TODO: Mock session and test conditional rendering
  });

  it('renders navigation links', () => {
    // TODO: Render with router context and check navigation
  });
}); 