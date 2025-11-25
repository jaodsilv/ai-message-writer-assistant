/**
 * User Storage
 * File-based user storage with encryption support
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from './password';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  defaultTone: string;
  defaultPlatform: string;
  preferredModels: string[];
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  highContrast: false,
  dyslexiaFont: false,
  reducedMotion: false,
  defaultTone: 'professional',
  defaultPlatform: 'email',
  preferredModels: ['claude'],
};

function getDataPath(): string {
  return process.env.DATA_PATH || './data';
}

function getUsersFilePath(): string {
  return path.join(getDataPath(), 'users.yaml');
}

async function ensureDataDir(): Promise<void> {
  const dataPath = getDataPath();
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true });
  }
}

async function loadUsers(): Promise<User[]> {
  const filePath = getUsersFilePath();

  if (!existsSync(filePath)) {
    return [];
  }

  const content = await readFile(filePath, 'utf-8');
  const data = yaml.load(content) as { users: User[] } | null;
  return data?.users || [];
}

async function saveUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  const filePath = getUsersFilePath();
  const content = yaml.dump({ users }, { lineWidth: -1 });
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<User | null> {
  const users = await loadUsers();

  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return null;
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_SETTINGS },
  };

  users.push(user);
  await saveUsers(users);

  return user;
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find(u => u.id === id) || null;
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  return isValid ? user : null;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<User | null> {
  const users = await loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = {
    ...users[userIndex],
    settings: { ...users[userIndex].settings, ...settings },
    updatedAt: new Date().toISOString(),
  };

  await saveUsers(users);
  return users[userIndex];
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; email?: string }
): Promise<User | null> {
  const users = await loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return null;
  }

  // Check if new email is already taken
  if (updates.email) {
    const existingUser = users.find(
      u => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== userId
    );
    if (existingUser) {
      return null;
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...(updates.name && { name: updates.name }),
    ...(updates.email && { email: updates.email.toLowerCase() }),
    updatedAt: new Date().toISOString(),
  };

  await saveUsers(users);
  return users[userIndex];
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const users = await loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex] = {
    ...users[userIndex],
    passwordHash: await hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  };

  await saveUsers(users);
  return true;
}
