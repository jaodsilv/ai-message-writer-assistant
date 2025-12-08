import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetadataPanel } from './MetadataPanel';

describe('MetadataPanel', () => {
    const mockProps = {
        context: ['Context line 1', 'Context line 2'],
        jobDescription: 'Software Engineer position',
        onUpdate: vi.fn(),
    };

    it('renders in collapsed state by default', () => {
        render(<MetadataPanel {...mockProps} />);
        expect(screen.queryByText('Context & Job')).not.toBeInTheDocument();
    });

    it('expands when expand button is clicked', () => {
        render(<MetadataPanel {...mockProps} />);
        const expandButton = screen.getByTitle('Expand Metadata');
        fireEvent.click(expandButton);
        expect(screen.getByText('Context & Job')).toBeInTheDocument();
    });

    it('displays context and job description when expanded', () => {
        render(<MetadataPanel {...mockProps} />);
        const expandButton = screen.getByTitle('Expand Metadata');
        fireEvent.click(expandButton);

        const contextTextarea = screen.getByPlaceholderText('Enter context details...') as HTMLTextAreaElement;
        const jobTextarea = screen.getByPlaceholderText('Paste job description...') as HTMLTextAreaElement;

        expect(contextTextarea.value).toBe('Context line 1\nContext line 2');
        expect(jobTextarea.value).toBe('Software Engineer position');
    });

    it('allows editing context', () => {
        render(<MetadataPanel {...mockProps} />);
        const expandButton = screen.getByTitle('Expand Metadata');
        fireEvent.click(expandButton);

        const contextTextarea = screen.getByPlaceholderText('Enter context details...') as HTMLTextAreaElement;
        fireEvent.change(contextTextarea, { target: { value: 'New context' } });

        expect(contextTextarea.value).toBe('New context');
    });

    it('allows editing job description', () => {
        render(<MetadataPanel {...mockProps} />);
        const expandButton = screen.getByTitle('Expand Metadata');
        fireEvent.click(expandButton);

        const jobTextarea = screen.getByPlaceholderText('Paste job description...') as HTMLTextAreaElement;
        fireEvent.change(jobTextarea, { target: { value: 'New job description' } });

        expect(jobTextarea.value).toBe('New job description');
    });

    it('calls onUpdate with filtered context when Save Changes is clicked', () => {
        render(<MetadataPanel {...mockProps} />);
        const expandButton = screen.getByTitle('Expand Metadata');
        fireEvent.click(expandButton);

        const contextTextarea = screen.getByPlaceholderText('Enter context details...') as HTMLTextAreaElement;
        fireEvent.change(contextTextarea, { target: { value: 'Line 1\n\nLine 2\n' } });

        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);

        expect(mockProps.onUpdate).toHaveBeenCalledWith(['Line 1', 'Line 2'], 'Software Engineer position');
    });
});
