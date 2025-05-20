import React from 'react';
import { render, screen } from '@testing-library/react';
import SessionProviderWrapper from '../components/SessionProviderWrapper';

describe('SessionProviderWrapper', () => {
  it('renders children', () => {
    render(
      <SessionProviderWrapper>
        <div>Child Content</div>
      </SessionProviderWrapper>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
}); 