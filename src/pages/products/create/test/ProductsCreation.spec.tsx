import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import ProductsCreation from '../ProductsCreation';

const mockPush = jest.fn();
const mockUseRouter = {
  push: mockPush,
  query: {} as any,
};

jest.mock('next/router', () => ({
  useRouter: () => mockUseRouter,
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    organizationList: [{ id: 123, name: 'Organization 1' }],
  }),
}));

const mockCreateProduct = jest.fn();
const mockGetProductById = jest.fn();
const mockUpdateProduct = jest.fn();

jest.mock('../../hooks/useProductQuery', () => ({
  useProductQuery: () => ({
    createProduct: mockCreateProduct,
    getProductById: mockGetProductById,
    updateProduct: mockUpdateProduct,
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProductsCreation Component', () => {
  const originalLocation = window.location;
  const NAME_INPUT = 'name-input';
  const PROD_NOVO = 'Produto Novo';
  const TOAST_NAME_EXISTS = 'toast.name-exists';
  const PROD_EDITANDO = 'Produto Editando';
  const ORG_123 = '123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '',
    };
    delete (window as any).location;
    window.location = { href: '', reload: jest.fn() } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('renders the "Nome" field', () => {
    render(<ProductsCreation />);
    const nameField = screen.getByTestId(NAME_INPUT);
    expect(nameField).toBeDefined();
  });

  it('renders the "Organização" field', () => {
    render(<ProductsCreation />);
    const orgField = screen.getByTestId('org-input');
    expect(orgField).toBeDefined();
  });

  it('renders the "Descrição" field', () => {
    render(<ProductsCreation />);
    const descriptionField = screen.getByTestId('description-input');
    expect(descriptionField).toBeDefined();
  });

  it('Deve corresponder ao Snapshot', () => {
    const tree = render(<ProductsCreation />);
    expect(tree).toMatchSnapshot();
  });

  it('deve submeter o formulário de criação com sucesso', async () => {
    mockCreateProduct.mockResolvedValue({ type: 'success' });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(NAME_INPUT).querySelector('input')!;
    const descInput = screen.getByTestId('description-input').querySelector('textarea')!;

    fireEvent.change(nameInput, { target: { value: PROD_NOVO } });
    fireEvent.change(descInput, { target: { value: 'Desc Novo' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: PROD_NOVO,
        description: 'Desc Novo',
        organizationId: 123,
      });
      expect(toast.success).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
      expect(window.location.href).toBe('/products');
    });
  });

  it('deve exibir toast.error se a criação de produto falhar com erro com mensagem ja existente', async () => {
    mockCreateProduct.mockResolvedValue({
      type: 'error',
      error: { message: TOAST_NAME_EXISTS },
    });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(NAME_INPUT).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: PROD_NOVO } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TOAST_NAME_EXISTS);
    });
  });

  it('deve exibir toast.error se a criação de produto falhar com outro erro', async () => {
    mockCreateProduct.mockResolvedValue({
      type: 'error',
      error: { message: 'other' },
    });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(NAME_INPUT).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: PROD_NOVO } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.error-create');
    });
  });

  it('deve capturar erro no catch se createProduct lançar exceção', async () => {
    mockCreateProduct.mockRejectedValue(new Error('Create Error'));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(NAME_INPUT).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: PROD_NOVO } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
    spy.mockRestore();
  });

  it('deve rodar em modo de edição se id_product estiver na query', async () => {
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: PROD_EDITANDO,
        description: 'Desc Editando',
        organizationId: 123,
      },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(PROD_EDITANDO);

    const nameInput = screen.getByTestId(NAME_INPUT).querySelector('input')!;
    expect(nameInput.value).toBe(PROD_EDITANDO);

    expect(mockGetProductById).toHaveBeenCalledWith([ORG_123], '456');
  });

  it('deve capturar erro no catch se getProductById lançar exceção', async () => {
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '456',
    };
    mockGetProductById.mockRejectedValue(new Error('Fetch Error'));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<ProductsCreation />);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
    spy.mockRestore();
  });

  it('deve atualizar o produto com sucesso em modo de edição', async () => {
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: PROD_EDITANDO,
        description: 'Desc Editando',
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({ type: 'success' });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(PROD_EDITANDO);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith('456', {
        name: PROD_EDITANDO,
        description: 'Desc Editando',
        organizationId: 123,
      });
      expect(toast.success).toHaveBeenCalledWith('toast.success-edit');
    });
  });

  it('deve tratar erro de edição com erro com mensagem ja existente', async () => {
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: PROD_EDITANDO,
        description: 'Desc Editando',
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({
      type: 'error',
      error: { message: TOAST_NAME_EXISTS },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(PROD_EDITANDO);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TOAST_NAME_EXISTS);
    });
  });

  it('deve tratar erro de edição com outro erro', async () => {
    mockUseRouter.query = {
      id_organization: [ORG_123],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: PROD_EDITANDO,
        description: 'Desc Editando',
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({
      type: 'error',
      error: { message: 'other' },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(PROD_EDITANDO);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.error-edit');
    });
  });

  it('deve alterar o organizationId no formulário', async () => {
    render(<ProductsCreation />);
    const selectWrapper = screen.getByTestId('org-input').querySelector('.MuiSelect-select')!;
    fireEvent.mouseDown(selectWrapper);

    const menuItem = await screen.findByRole('option', { name: 'Organization 1' });
    fireEvent.click(menuItem);

    await waitFor(() => {
      const input = screen.getByTestId('org-input').querySelector('input')!;
      expect(input.value).toBe('123');
    });
  });

  it('deve voltar para a listagem ao clicar no botão de voltar', () => {
    render(<ProductsCreation />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('/products');
  });
});
