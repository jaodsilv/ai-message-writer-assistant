export interface StorageService {
    save(collection: string, id: string, data: any): Promise<void>;
    load(collection: string, id: string): Promise<any | null>;
    list(collection: string): Promise<string[]>;
    delete(collection: string, id: string): Promise<void>;
}
