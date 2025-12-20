import React from 'react';
import {render, fireEvent} from '@testing-library/react-native'
import ConfirmModal from '../components/ui/modalWithButtons';

describe("ConfirmModal (modalWithButtons)", ()=>{
       const mockOnClose = jest.fn();
       const mockOnConfirm = jest.fn();
      beforeEach(()=>{
        jest.clearAllMocks();
      });

      describe ('Rendering', ()=> {
    it("renders message when visible=true", ()=>{
       const {getByText} = render(
            <ConfirmModal
               visible = {true}
               type = "success"
               message = "Test message"
               showConfirm = {false}
               onClose = {mockOnClose}
               />
        );
        expect(getByText('Success')).toBeTruthy();
        expect(getByText('Test message')).toBeTruthy();
        expect(getByText('OK')).toBeTruthy();
    });
    it('renders success type by default', ()=>{
        const {getByText} = render (
            <ConfirmModal
            visible = {true}
            message = "Success message"
            onClose = {mockOnClose}
            />
        );
        expect(getByText('Success')).toBeTruthy();
    });
    it('renders error type when specified', ()=>{
        const {getByText} = render(
            <ConfirmModal
            visible = {true}
            type ="error"
            message = "Error message"
            onClose = {mockOnClose}
            />
        );
        expect(getByText('Error')).toBeTruthy();
    });
});

describe('Button Visibility', ()=>{
    it('shows only OK button when showConfirm is false', ()=>{
        const { getByText, queryByText} = render(
            <ConfirmModal
            visible = {true}
            message = "Test message"
            onClose = {mockOnClose}
            showConfirm = {false}
            />
        );
        expect(getByText('OK')).toBeTruthy();
        expect(queryByText('Confirm')).toBeFalsy();
        expect(queryByText('Cancel')).toBeFalsy();
    });

    it('shows Confirm and Cancel buttons when showConfirm is true', ()=>{
        const {getByText} = render(
            <ConfirmModal
            visible = {true}
            message = "Test message"
            onClose = {mockOnClose}
            onConfirm = {mockOnConfirm}
            showConfirm = {true}
            />
        );

        expect(getByText('Confirm')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
    });
        it('does not show Confirm button if onConfirm is not provided', () => {
      const { queryByText, getByText } = render(
        <ConfirmModal
          visible={true}
          message="Test message"
          onClose={mockOnClose}
          showConfirm={true}
        />
      );

      expect(queryByText('Confirm')).toBeFalsy();
      expect(getByText('Cancel')).toBeTruthy();
    });
});
  describe('User Interactions', () => {
    it('calls onClose when OK button is pressed', () => {
      const { getByText } = render(
        <ConfirmModal
          visible={true}
          message="Test message"
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('OK'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel button is pressed', () => {
      const { getByText } = render(
        <ConfirmModal
          visible={true}
          message="Test message"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          showConfirm={true}
        />
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls both onConfirm and onClose when Confirm button is pressed', () => {
      const { getByText } = render(
        <ConfirmModal
          visible={true}
          message="Test message"
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          showConfirm={true}
        />
      );

      fireEvent.press(getByText('Confirm'));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  
 });