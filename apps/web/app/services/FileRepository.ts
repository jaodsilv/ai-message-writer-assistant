import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { StorageService } from './StorageService';

export class FileRepository implements StorageService {
    private dataDir: string;

    constructor(dataDir: string) {
        this.dataDir = dataDir;
    }

    private getCollectionPath(collection: string): string {
        return path.join(this.dataDir, collection);
    }

    private getFilePath(collection: string, id: string): string {
        return path.join(this.getCollectionPath(collection), `${id}.yaml`);
    }

    async save(collection: string, id: string, data: any): Promise<void> {
        const collectionPath = this.getCollectionPath(collection);
        try {
            await fs.mkdir(collectionPath, { recursive: true });
            const filePath = this.getFilePath(collection, id);
            const yamlData = yaml.dump(data);
            await fs.writeFile(filePath, yamlData, 'utf-8');
        } catch (error) {
            console.error(`Error saving to ${collection}/${id}:`, error);
            throw error;
        }
    }

    async load(collection: string, id: string): Promise<any | null> {
        const filePath = this.getFilePath(collection, id);
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            return yaml.load(fileContent);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return null;
            }
            console.error(`Error loading from ${collection}/${id}:`, error);
            throw error;
        }
    }

    async list(collection: string, includeArchived: boolean = false): Promise<string[]> {
        const collectionPath = this.getCollectionPath(collection);
        try {
            const files = await fs.readdir(collectionPath);
            let results = files
                .filter(file => file.endsWith('.yaml'))
                .map(file => path.basename(file, '.yaml'));

            if (includeArchived) {
                const archivePath = path.join(collectionPath, 'archive');
                try {
                    const archivedFiles = await fs.readdir(archivePath);
                    const archivedIds = archivedFiles
                        .filter(file => file.endsWith('.yaml'))
                        .map(file => path.basename(file, '.yaml'));
                    results = [...results, ...archivedIds];
                } catch (e: any) {
                    if (e.code !== 'ENOENT') throw e;
                }
            }
            return results;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return [];
            }
            console.error(`Error listing ${collection}:`, error);
            throw error;
        }
    }

    async delete(collection: string, id: string): Promise<void> {
        // Soft delete: move to trash
        const sourcePath = this.getFilePath(collection, id);
        const trashDir = path.join(this.getCollectionPath(collection), 'trash');
        const destPath = path.join(trashDir, `${id}.yaml`);

        try {
            await fs.mkdir(trashDir, { recursive: true });
            await fs.rename(sourcePath, destPath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Error deleting (soft) ${collection}/${id}:`, error);
                throw error;
            }
        }
    }

    async hardDelete(collection: string, id: string): Promise<void> {
        const filePath = this.getFilePath(collection, id);
        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Error hard deleting ${collection}/${id}:`, error);
                throw error;
            }
        }
    }

    async archive(collection: string, id: string): Promise<void> {
        const sourcePath = this.getFilePath(collection, id);
        const archiveDir = path.join(this.getCollectionPath(collection), 'archive');
        const destPath = path.join(archiveDir, `${id}.yaml`);

        try {
            await fs.mkdir(archiveDir, { recursive: true });
            await fs.rename(sourcePath, destPath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Error archiving ${collection}/${id}:`, error);
                throw error;
            }
        }
    }

    async restore(collection: string, id: string): Promise<void> {
        // Try restoring from archive first, then trash
        const collectionPath = this.getCollectionPath(collection);
        const destPath = this.getFilePath(collection, id);

        const archivePath = path.join(collectionPath, 'archive', `${id}.yaml`);
        const trashPath = path.join(collectionPath, 'trash', `${id}.yaml`);

        try {
            // Check archive
            try {
                await fs.access(archivePath);
                await fs.rename(archivePath, destPath);
                return;
            } catch { }

            // Check trash
            try {
                await fs.access(trashPath);
                await fs.rename(trashPath, destPath);
                return;
            } catch { }

            console.warn(`File ${id} not found in archive or trash to restore.`);

        } catch (error: any) {
            console.error(`Error restoring ${collection}/${id}:`, error);
            throw error;
        }
    }

    async exists(collection: string, id: string): Promise<boolean> {
        const filePath = this.getFilePath(collection, id);
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}
