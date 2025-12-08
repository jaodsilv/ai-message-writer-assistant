import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileRepository } from './FileRepository';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('FileRepository', () => {
    const dataDir = '/tmp/test-data';
    let repository: FileRepository;

    beforeEach(() => {
        repository = new FileRepository(dataDir);
        vi.resetAllMocks();
    });

    it('should save a file', async () => {
        const collection = 'conversations';
        const id = 'test-id';
        const data = { foo: 'bar' };

        await repository.save(collection, id, data);

        expect(fs.mkdir).toHaveBeenCalledWith(path.join(dataDir, collection), { recursive: true });
        expect(fs.writeFile).toHaveBeenCalledWith(
            path.join(dataDir, collection, `${id}.yaml`),
            expect.stringContaining('foo: bar'),
            'utf-8'
        );
    });

    it('should load a file', async () => {
        const collection = 'conversations';
        const id = 'test-id';
        const mockContent = 'foo: bar';

        vi.mocked(fs.readFile).mockResolvedValue(mockContent);

        const result = await repository.load(collection, id);

        expect(result).toEqual({ foo: 'bar' });
        expect(fs.readFile).toHaveBeenCalledWith(
            path.join(dataDir, collection, `${id}.yaml`),
            'utf-8'
        );
    });

    it('should return null if file does not exist', async () => {
        const collection = 'conversations';
        const id = 'non-existent';

        const error: any = new Error('ENOENT');
        error.code = 'ENOENT';
        vi.mocked(fs.readFile).mockRejectedValue(error);

        const result = await repository.load(collection, id);

        expect(result).toBeNull();
    });

    it('should list files in a collection', async () => {
        const collection = 'conversations';
        const files = ['file1.yaml', 'file2.yaml', 'other.txt'];

        vi.mocked(fs.readdir).mockResolvedValue(files as any);

        const result = await repository.list(collection);

        expect(result).toEqual(['file1', 'file2']);
    });

    it('should soft delete a file (move to trash)', async () => {
        const collection = 'conversations';
        const id = 'test-id';

        await repository.delete(collection, id);

        expect(fs.mkdir).toHaveBeenCalledWith(path.join(dataDir, collection, 'trash'), { recursive: true });
        expect(fs.rename).toHaveBeenCalledWith(
            path.join(dataDir, collection, `${id}.yaml`),
            path.join(dataDir, collection, 'trash', `${id}.yaml`)
        );
    });

    it('should hard delete a file', async () => {
        const collection = 'conversations';
        const id = 'test-id';

        await repository.hardDelete(collection, id);

        expect(fs.unlink).toHaveBeenCalledWith(path.join(dataDir, collection, `${id}.yaml`));
    });

    it('should archive a file', async () => {
        const collection = 'conversations';
        const id = 'test-id';

        await repository.archive(collection, id);

        expect(fs.mkdir).toHaveBeenCalledWith(path.join(dataDir, collection, 'archive'), { recursive: true });
        expect(fs.rename).toHaveBeenCalledWith(
            path.join(dataDir, collection, `${id}.yaml`),
            path.join(dataDir, collection, 'archive', `${id}.yaml`)
        );
    });

    it('should restore a file from archive', async () => {
        const collection = 'conversations';
        const id = 'test-id';

        // Mock access to succeed for archive path
        vi.mocked(fs.access).mockImplementation(async (p) => {
            if (typeof p === 'string' && p.includes('archive')) return Promise.resolve();
            return Promise.reject(new Error('ENOENT'));
        });

        await repository.restore(collection, id);

        expect(fs.rename).toHaveBeenCalledWith(
            path.join(dataDir, collection, 'archive', `${id}.yaml`),
            path.join(dataDir, collection, `${id}.yaml`)
        );
    });
});
