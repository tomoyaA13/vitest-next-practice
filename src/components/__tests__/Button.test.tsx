// components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('レンダリングされること', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('クリックイベントが発火すること', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabledの時はクリックできないこと', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('variantによってスタイルが変わること', () => {
    const { rerender } = render(<Button variant='primary'>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant='secondary'>Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});
