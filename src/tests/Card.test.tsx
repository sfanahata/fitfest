import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../components/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    render(<Card className="test-class">Content</Card>);
    expect(screen.getByText('Content').parentElement).toHaveClass('test-class');
  });
}); 