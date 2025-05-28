import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../components/Card';

describe('Card Component', () => {
  test('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies default background class of bg-gray-50', () => {
    const { container } = render(<Card>Test Content</Card>);
    expect(container.firstChild).toHaveClass('bg-gray-50');
  });

  test('combines custom classNames with default classes', () => {
    const { container } = render(<Card className="custom-class">Test Content</Card>);
    expect(container.firstChild).toHaveClass('bg-gray-50', 'custom-class');
  });
});