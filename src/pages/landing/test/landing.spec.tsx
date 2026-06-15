import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Landing from '../index.page';
import { EXTERNAL_LINKS } from '../constants';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Landing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza as secoes principais da landing', () => {
    render(<Landing />);

    expect(screen.getByText('hero.title')).toBeInTheDocument();
    expect(screen.getByText('howItWorks.title')).toBeInTheDocument();
    expect(screen.getByText('value.title')).toBeInTheDocument();
    expect(screen.getByText('community.title')).toBeInTheDocument();
  });

  it('o CTA principal do hero leva o usuario para /auth', () => {
    render(<Landing />);

    const ctas = screen.getAllByRole('button', { name: 'hero.primaryCta' });
    fireEvent.click(ctas[0]);

    expect(mockPush).toHaveBeenCalledWith('/auth');
  });

  it('expoe os links externos publicos esperados', () => {
    render(<Landing />);

    const docsLinks = screen.getAllByRole('link', { name: 'nav.docs' });
    expect(docsLinks[0]).toHaveAttribute('href', EXTERNAL_LINKS.docs);
    expect(docsLinks[0]).toHaveAttribute('target', '_blank');
  });
});
