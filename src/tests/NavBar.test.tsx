import React from 'react';
import { render, screen } from '@testing-library/react';
import NavBar from '../components/NavBar';
import { SessionProvider } from 'next-auth/react';
import userEvent from '@testing-library/user-event';

describe('NavBar', () => {
  it('renders navigation links', () => {
    render(
      <SessionProvider session={null}>
        <NavBar />
      </SessionProvider>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Activities/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  it('renders sign out button when session exists', () => {
    // TODO: Mock session with a user
  });

  it('does not render when no session', () => {
    render(
      <SessionProvider session={null}>
        <NavBar />
      </SessionProvider>
    );
    // NavBar returns null if no session
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
}); 