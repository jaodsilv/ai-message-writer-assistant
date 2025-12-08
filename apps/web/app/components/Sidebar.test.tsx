import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
    const mockProps = {
        conversations: ['conv1', 'conv2'],
        currentConversationId: 'conv1',
        onSelectConversation: vi.fn(),
        onNewConversation: vi.fn(),
        onLoadConversation: vi.fn(),
    };

    it('renders conversation list', () => {
        render(<Sidebar {...mockProps} />);
        expect(screen.getByText('conv1')).toBeInTheDocument();
        expect(screen.getByText('conv2')).toBeInTheDocument();
    });

    it('calls onSelectConversation when a conversation is clicked', () => {
        render(<Sidebar {...mockProps} />);
        fireEvent.click(screen.getByText('conv2'));
        expect(mockProps.onSelectConversation).toHaveBeenCalledWith('conv2');
    });

    it('calls onNewConversation when "New Conversation" button is clicked', () => {
        render(<Sidebar {...mockProps} />);
        fireEvent.click(screen.getByText('+ New Conversation'));
        expect(mockProps.onNewConversation).toHaveBeenCalled();
    });

    it('calls onLoadConversation when a file is selected', () => {
        const { container } = render(<Sidebar {...mockProps} />);
        const file = new File(['content'], 'test.yaml', { type: 'application/x-yaml' });
        const input = container.querySelector('input[type="file"]');

        if (input) {
            fireEvent.change(input, { target: { files: [file] } });
            expect(mockProps.onLoadConversation).toHaveBeenCalledWith(file);
        } else {
            throw new Error('File input not found');
        }
    });
});
