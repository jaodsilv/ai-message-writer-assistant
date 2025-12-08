import { describe, it, expect, beforeEach } from 'vitest';
import { UndoService } from './UndoService';

describe('UndoService', () => {
    let service: UndoService;

    beforeEach(() => {
        service = new UndoService();
    });

    it('should start empty', () => {
        expect(service.canUndo).toBe(false);
        expect(service.pop()).toBeUndefined();
    });

    it('should push and pop actions', () => {
        service.push({ type: 'delete', collection: 'conversations', id: '1' });
        expect(service.canUndo).toBe(true);

        const action = service.pop();
        expect(action).toEqual({ type: 'delete', collection: 'conversations', id: '1' });
        expect(service.canUndo).toBe(false);
    });

    it('should handle multiple actions (stack behavior)', () => {
        service.push({ type: 'delete', collection: 'conversations', id: '1' });
        service.push({ type: 'archive', collection: 'conversations', id: '2' });

        const action1 = service.pop();
        expect(action1?.type).toBe('archive');
        expect(action1?.id).toBe('2');

        const action2 = service.pop();
        expect(action2?.type).toBe('delete');
        expect(action2?.id).toBe('1');
    });
});
