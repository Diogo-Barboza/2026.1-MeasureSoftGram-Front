import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal Component', () => {
  const mockSetIsModalOpen = jest.fn();
  const mockHandleConfirmBtnClick = jest.fn();
  const mockHandleDismissBtnClick = jest.fn();

  const proceedMessage = 'Are you sure you want to proceed?';

  const defaultProps = {
    text: proceedMessage,
    btnConfirmText: 'Confirm',
    btnDismissText: 'Cancel',
    isModalOpen: true,
    setIsModalOpen: mockSetIsModalOpen,
    handleConfirmBtnClick: mockHandleConfirmBtnClick,
    handleDismissBtnClick: mockHandleDismissBtnClick,
  };

  it('should render the modal when isModalOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText(proceedMessage)).toBeInTheDocument();
  });

  it('should not render the modal when isModalOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isModalOpen={false} />);
    expect(screen.queryByText(proceedMessage)).not.toBeInTheDocument();
  });

  it('should call handleConfirmBtnClick when the confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockHandleConfirmBtnClick).toHaveBeenCalled();
  });

  it('should call handleDismissBtnClick when the dismiss button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockHandleDismissBtnClick).toHaveBeenCalled();
  });
});
