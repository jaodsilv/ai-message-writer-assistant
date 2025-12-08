import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface User {
    id: string;
    username: string;
}

export interface AuthService {
    login(password: string): Promise<User | null>;
    isAuthenticated(): boolean;
    getUser(): User | null;
}

export class LocalFileAuthService implements AuthService {
    private configPath: string;
    private currentUser: User | null = null;

    constructor(configDir: string) {
        this.configPath = path.join(configDir, 'auth.json');
    }

    async login(password: string): Promise<User | null> {
        // In a real app, we would load the hash from the file and compare.
        // For this MVP/Prototype, we'll just check if the file exists, if not create it with the first password.
        // If it exists, we verify.

        try {
            const data = await fs.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(data);
            const hash = crypto.createHash('sha256').update(password).digest('hex'); // Simple hash for MVP

            if (config.passwordHash === hash) {
                this.currentUser = { id: 'admin', username: 'Admin' };
                return this.currentUser;
            }
            return null;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                // First run setup
                const hash = crypto.createHash('sha256').update(password).digest('hex');
                await fs.writeFile(this.configPath, JSON.stringify({ passwordHash: hash }));
                this.currentUser = { id: 'admin', username: 'Admin' };
                return this.currentUser;
            }
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    getUser(): User | null {
        return this.currentUser;
    }
}
