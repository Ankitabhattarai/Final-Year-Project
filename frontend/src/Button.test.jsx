import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// A simple dummy component to prove React testing is configured
const Button = ({ label }) => {
  return <button>{label}</button>;
};

describe('Frontend React Component Tests', () => {
  it('renders a button with correct text', () => {
    render(<Button label="Click Me" />);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });
});
