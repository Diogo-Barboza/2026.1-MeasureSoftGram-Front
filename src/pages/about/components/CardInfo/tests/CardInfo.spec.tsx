import React from 'react';
import { render, screen } from '@testing-library/react';
import CardInfo from '../CardInfo';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('CardInfo Component', () => {
  const CARD_TITLE = 'Título Principal do Card';
  const CARD_DESCRIPTION = 'Descrição do primeiro elemento';
  const CARD_DESCRIPTION_ALT = 'Desc';

  it('deve renderizar o título principal e as descrições básicas', () => {
    const mockData = {
      id: 'card-1',
      title: CARD_TITLE,
      elements: [
        {
          title: 'Subtítulo 1',
          description: 'Descrição do primeiro elemento',
          imageSrc: 'https://site.com/imagem.png',
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText(CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText('Subtítulo 1')).toBeInTheDocument();
    expect(screen.getByText(CARD_DESCRIPTION)).toBeInTheDocument();

    const image = screen.getByAltText('green iguana');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://site.com/imagem.png');
  });

  it('deve renderizar ícones React (não-string) e sem título principal', () => {
    const mockData = {
      id: 'card-2',
      elements: [
        {
          title: 'Subtítulo Ícone',
          description: 'Teste com ícone',
          imageSrc: <svg data-testid="mock-icon" />,
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.queryByText('Título Principal do Card')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('deve renderizar os botões quando a rota for "products"', () => {
    const mockData = {
      id: 'card-3',
      elements: [
        {
          title: 'Rota de Produtos',
          description: 'Desc',
          imageSrc: 'https://site.com/imagem.png',
          routeTo: 'products'
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText('organization.view-organization')).toBeInTheDocument();
    expect(screen.getByText('organization.create-organization')).toBeInTheDocument();
  });

  it('deve renderizar o botão quando a rota for "products/create"', () => {
    const mockData = {
      id: 'card-4',
      elements: [
        {
          title: 'Rota de Criação',
          description: 'Desc',
          imageSrc: 'https://site.com/imagem.png',
          routeTo: 'products/create'
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText('product.create-product')).toBeInTheDocument();
    expect(screen.queryByText('organization.view-organization')).not.toBeInTheDocument();
  });

  it('não deve renderizar botões quando não há rota de ação', () => {
    const mockData = {
      id: 'card-5',
      elements: [
        {
          title: 'Sem Rota',
          description: 'Sem ação',
          imageSrc: 'https://site.com/imagem.png'
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.queryByText('organization.view-organization')).not.toBeInTheDocument();
    expect(screen.queryByText('organization.create-organization')).not.toBeInTheDocument();
    expect(screen.queryByText('product.create-product')).not.toBeInTheDocument();
  });
});
