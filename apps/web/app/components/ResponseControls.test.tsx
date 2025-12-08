import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResponseControls } from './ResponseControls';

describe('ResponseControls', () => {
    const mockProps = {
        selectedWriterType: 'ai' as const,
        selectedModel: 'claude',
        selectedPerson: 'me',
        availablePeople: ['Alice', 'Bob'],
        onWriterTypeChange: vi.fn(),
        onModelChange: vi.fn(),
        onPersonChange: vi.fn(),
        onGenerate: vi.fn(),
        isGenerating: false,
    };

    it('renders writer type buttons', () => {
        render(<ResponseControls {...mockProps} />);
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Person')).toBeInTheDocument();
    });

    it('highlights the selected writer type', () => {
        render(<ResponseControls {...mockProps} />);
        const aiButton = screen.getByText('AI');
        expect(aiButton).toHaveClass('bg-blue-600');
    });

    it('calls onWriterTypeChange when writer type is changed', () => {
        render(<ResponseControls {...mockProps} />);
        const personButton = screen.getByText('Person');
        fireEvent.click(personButton);
        expect(mockProps.onWriterTypeChange).toHaveBeenCalledWith('person');
    });

    it('shows model selector when AI is selected', () => {
        render(<ResponseControls {...mockProps} />);
        expect(screen.getByLabelText('Model:')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Claude')).toBeInTheDocument();
    });

    it('does not show model selector when Person is selected', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" />);
        expect(screen.queryByLabelText('Model:')).not.toBeInTheDocument();
    });

    it('calls onModelChange when model is changed', () => {
        render(<ResponseControls {...mockProps} />);
        const modelSelect = screen.getByLabelText('Model:');
        fireEvent.change(modelSelect, { target: { value: 'gemini' } });
        expect(mockProps.onModelChange).toHaveBeenCalledWith('gemini');
    });

    it('shows person selector when Person is selected', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" />);
        expect(screen.getByLabelText('Who:')).toBeInTheDocument();
    });

    it('lists available people in the selector', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('calls onPersonChange when person is changed', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" />);
        const personSelect = screen.getByLabelText('Who:');
        fireEvent.change(personSelect, { target: { value: 'Alice' } });
        expect(mockProps.onPersonChange).toHaveBeenCalledWith('Alice');
    });

    it('shows new person input when "new" is selected', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" selectedPerson="new" />);
        expect(screen.getByPlaceholderText('Enter name...')).toBeInTheDocument();
    });

    it('calls onPersonChange with new name when new person input is blurred', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" selectedPerson="new" />);
        const nameInput = screen.getByPlaceholderText('Enter name...') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Charlie' } });
        fireEvent.blur(nameInput);
        expect(mockProps.onPersonChange).toHaveBeenCalledWith('Charlie');
    });

    it('shows Generate button when AI is selected', () => {
        render(<ResponseControls {...mockProps} />);
        expect(screen.getByText('Generate Response')).toBeInTheDocument();
    });

    it('does not show Generate button when Person is selected', () => {
        render(<ResponseControls {...mockProps} selectedWriterType="person" />);
        expect(screen.queryByText('Generate Response')).not.toBeInTheDocument();
    });

    it('calls onGenerate when Generate button is clicked', () => {
        render(<ResponseControls {...mockProps} />);
        const generateButton = screen.getByText('Generate Response');
        fireEvent.click(generateButton);
        expect(mockProps.onGenerate).toHaveBeenCalled();
    });

    it('disables Generate button when generating', () => {
        render(<ResponseControls {...mockProps} isGenerating={true} />);
        const generateButton = screen.getByText('Generating...');
        expect(generateButton).toBeDisabled();
    });

    it('shows loading state when generating', () => {
        render(<ResponseControls {...mockProps} isGenerating={true} />);
        expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
});
