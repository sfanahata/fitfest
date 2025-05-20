import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../app/profile/page';

describe('ProfilePage', () => {
  it('renders profile info', () => {
    // TODO: Mock session and profile data
  });

  it('protects route if not signed in', () => {
    // TODO: Test redirect or error if no session
  });
}); 