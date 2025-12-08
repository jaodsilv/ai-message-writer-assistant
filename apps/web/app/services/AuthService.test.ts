import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalFileAuthService } from './AuthService';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

vi.mock('fs/promises');

describe('LocalFileAuthService', () => {
    const configDir = '/tmp/config';
    const configPath = path.join(configDir, 'auth.json');
    let authService: LocalFileAuthService;

    beforeEach(() => {
        authService = new LocalFileAuthService(configDir);
        vi.resetAllMocks();
    });

    it('should create auth file if it does not exist on login', async () => {
        const password = 'password123';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Mock readFile to throw ENOENT
        vi.mocked(fs.readFile).mockRejectedValue({ code: 'ENOENT' });
        // Mock writeFile
        vi.mocked(fs.writeFile).mockResolvedValue(undefined);

        const user = await authService.login(password);

        expect(fs.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
        expect(fs.writeFile).toHaveBeenCalledWith(configPath, JSON.stringify({ passwordHash: hashedPassword }));
        expect(user).toEqual({ id: 'admin', username: 'Admin' });
        expect(authService.isAuthenticated()).toBe(true);
    });

    it('should login successfully with correct password', async () => {
        const password = 'password123';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Mock readFile to return config
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ passwordHash: hashedPassword }));

        const user = await authService.login(password);

        expect(fs.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
        expect(user).toEqual({ id: 'admin', username: 'Admin' });
        expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return null with incorrect password', async () => {
        const password = 'password123';
        const wrongPassword = 'wrongpassword';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Mock readFile to return config
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ passwordHash: hashedPassword }));

        const user = await authService.login(wrongPassword);

        expect(fs.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
        expect(user).toBeNull();
        expect(authService.isAuthenticated()).toBe(false);
    });

    it('should throw error if readFile fails with other error', async () => {
        const error = new Error('Read error');
        vi.mocked(fs.readFile).mockRejectedValue(error);

        await expect(authService.login('password')).rejects.toThrow('Read error');
    });

    it('should return current user', async () => {
        expect(authService.getUser()).toBeNull();

        const password = 'password123';
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ passwordHash: hashedPassword }));

        await authService.login(password);

        expect(authService.getUser()).toEqual({ id: 'admin', username: 'Admin' });
    });
});
