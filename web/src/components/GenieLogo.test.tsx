import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenieLogo } from './GenieLogo';

/** MVP feedback item 3: the 3D "i" scales with the wordmark instead of staying a fixed pixel size. */
describe('GenieLogo', () => {
  it.each(['sm', 'header', 'md', 'lg', 'hero'] as const)('sizes the "i" in em at size %s', (size) => {
    render(<GenieLogo size={size} />);
    const icon = screen.getAllByTestId('genie-logo-i').at(-1)!;

    expect(icon.style.height).toMatch(/^\d+(\.\d+)?em$/);
    expect(icon.style.width).toBe('auto');
    // No fixed pixel attributes left that would stop it shrinking on phones.
    expect(icon.getAttribute('width')).toBeNull();
    expect(icon.getAttribute('height')).toBeNull();
  });

  it('keeps the hero "i" a little shorter than the letters, as on desktop', () => {
    render(<GenieLogo size="hero" />);
    expect(screen.getAllByTestId('genie-logo-i').at(-1)!.style.height).toBe('0.86em');
  });
});
