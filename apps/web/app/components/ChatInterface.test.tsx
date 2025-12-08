import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInterface } from './ChatInterface';
import { Message } from '../agents/ModelInterface';

describe('ChatInterface', () => {
    const mockMessages: Message[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
    ];

    const mockProps = {
        messages: mockMessages,
        conversations: ['conv1', 'conv2'],
        currentConversationId: 'conv1',
        context: ['Context 1'],
        jobDescription: 'Job description',
        availablePeople: ['Alice', 'Bob'],
        onSendMessage: vi.fn(),
        onSelectConversation: vi.fn(),
        onNewConversation: vi.fn(),
        onLoadConversation: vi.fn(),
        onUpdateMetadata: vi.fn(),
        onGenerateResponse: vi.fn(),
        isLoading: false,
        onArchive: vi.fn(),
        onRestore: vi.fn(),
        onDelete: vi.fn(),
        onUndo: vi.fn(),
        onParseMessage: vi.fn(),
        showArchived: false,
        onToggleArchived: vi.fn(),
        canUndo: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders messages', () => {
        render(<ChatInterface {...mockProps} />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('renders conversation title', () => {
        render(<ChatInterface {...mockProps} />);
        const title = screen.getByRole('heading', { name: 'conv1' });
        expect(title).toBeInTheDocument();
    });

    it('shows message input when Person/Me is selected', () => {
        render(<ChatInterface {...mockProps} />);
        const personButton = screen.getByText('Person');
        fireEvent.click(personButton);
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    });

    it('sends message when form is submitted', () => {
        render(<ChatInterface {...mockProps} />);
        const personButton = screen.getByText('Person');
        fireEvent.click(personButton);

        const input = screen.getByPlaceholderText('Type your message here...') as HTMLInputElement;
        const form = input.closest('form');

        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(form!);

        expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test message');
        expect(input.value).toBe('');
    });

    it('does not send empty messages', () => {
        render(<ChatInterface {...mockProps} />);
        const personButton = screen.getByText('Person');
        fireEvent.click(personButton);

        const input = screen.getByPlaceholderText('Type your message here...') as HTMLInputElement;
        const form = input.closest('form');

        fireEvent.change(input, { target: { value: '   ' } });
        fireEvent.submit(form!);

        expect(mockProps.onSendMessage).not.toHaveBeenCalled();
    });

    it('disables input when loading', () => {
        render(<ChatInterface {...mockProps} isLoading={true} />);
        const personButton = screen.getByText('Person');
        fireEvent.click(personButton);

        const input = screen.getByPlaceholderText('Type your message here...') as HTMLInputElement;
        expect(input).toBeDisabled();
    });

    it('calls onArchive when archive button is clicked', () => {
        render(<ChatInterface {...mockProps} />);
        const archiveButton = screen.getByTitle('Archive');
        fireEvent.click(archiveButton);
        expect(mockProps.onArchive).toHaveBeenCalled();
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<ChatInterface {...mockProps} />);
        const deleteButton = screen.getByTitle('Delete');
        fireEvent.click(deleteButton);
        expect(mockProps.onDelete).toHaveBeenCalled();
    });

    it('calls onToggleArchived when toggle archived button is clicked', () => {
        render(<ChatInterface {...mockProps} />);
        const toggleButton = screen.getByTitle('Show Archived');
        fireEvent.click(toggleButton);
        expect(mockProps.onToggleArchived).toHaveBeenCalled();
    });

    it('shows Restore button when showArchived is true', () => {
        render(<ChatInterface {...mockProps} showArchived={true} />);
        expect(screen.getByTitle('Restore')).toBeInTheDocument();
        expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
    });

    it('shows Undo button when canUndo is true', () => {
        render(<ChatInterface {...mockProps} canUndo={true} />);
        const undoButton = screen.getByTitle('Undo');
        expect(undoButton).toBeInTheDocument();
    });

    it('calls onUndo when undo button is clicked', () => {
        render(<ChatInterface {...mockProps} canUndo={true} />);
        const undoButton = screen.getByTitle('Undo');
        fireEvent.click(undoButton);
        expect(mockProps.onUndo).toHaveBeenCalled();
    });

    it('opens parse modal when parse button is clicked', () => {
        render(<ChatInterface {...mockProps} />);
        const parseButton = screen.getByTitle('Parse Message');
        fireEvent.click(parseButton);
        expect(screen.getByText('Parse Message')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Paste LinkedIn or Email message here...')).toBeInTheDocument();
    });

    it('calls onParseMessage when parse is submitted', () => {
        render(<ChatInterface {...mockProps} />);
        const parseButton = screen.getByTitle('Parse Message');
        fireEvent.click(parseButton);

        const textarea = screen.getByPlaceholderText('Paste LinkedIn or Email message here...') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'Test parse content' } });

        const submitButton = screen.getByText('Parse');
        fireEvent.click(submitButton);

        expect(mockProps.onParseMessage).toHaveBeenCalledWith('Test parse content');
    });

    it('closes parse modal when cancel is clicked', () => {
        render(<ChatInterface {...mockProps} />);
        const parseButton = screen.getByTitle('Parse Message');
        fireEvent.click(parseButton);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByPlaceholderText('Paste LinkedIn or Email message here...')).not.toBeInTheDocument();
    });

    it('renders Sidebar component', () => {
        render(<ChatInterface {...mockProps} />);
        expect(screen.getByText('+ New Conversation')).toBeInTheDocument();
    });

    it('renders ResponseControls component', () => {
        render(<ChatInterface {...mockProps} />);
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Person')).toBeInTheDocument();
    });

    it('renders MetadataPanel component', () => {
        render(<ChatInterface {...mockProps} />);
        // MetadataPanel starts collapsed, so we check for the expand button
        expect(screen.getByTitle('Expand Metadata')).toBeInTheDocument();
    });
});
