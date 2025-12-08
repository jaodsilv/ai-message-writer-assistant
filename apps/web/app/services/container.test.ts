import { describe, it, expect, vi } from 'vitest';
import { getServices } from './container';

// Mock dependencies to avoid side effects
vi.mock('../agents/MemoryManager');
vi.mock('../agents/Orchestrator');
vi.mock('./FileRepository');
vi.mock('./MessageParserService');
vi.mock('./UndoService');
vi.mock('../agents/ClaudeAgent');
vi.mock('../agents/ClaudeCodeAgent');

describe('container', () => {
    it('should return service instances', () => {
        const services = getServices();

        expect(services).toHaveProperty('memoryManager');
        expect(services).toHaveProperty('orchestrator');
        expect(services).toHaveProperty('fileRepository');
        expect(services).toHaveProperty('messageParser');
        expect(services).toHaveProperty('undoService');
    });

    it('should return the same instances on subsequent calls (singleton)', () => {
        const services1 = getServices();
        const services2 = getServices();

        expect(services1.memoryManager).toBe(services2.memoryManager);
        expect(services1.orchestrator).toBe(services2.orchestrator);
        expect(services1.fileRepository).toBe(services2.fileRepository);
    });
});
