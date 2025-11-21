/**
 * Data Paths Configuration
 *
 * Centralized configuration for all data storage paths in the application.
 * Supports environment variable override for flexible deployment.
 */

import path from "node:path";

/**
 * Get the root data directory path
 * Can be overridden via DATA_DIR environment variable
 * Default: ./data (which is a symlink to ../ai-message-writer-data)
 */
export function getDataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
}

/**
 * Data directory paths configuration
 */
export const dataPaths = {
  /**
   * Root data directory
   */
  root: getDataDir(),

  /**
   * Signature exports directory
   * Contains platform-specific signatures (email, LinkedIn, etc.)
   */
  exports: path.join(getDataDir(), "exports"),

  /**
   * Message history directory
   * Contains AI-generated messages and drafts
   */
  messages: path.join(getDataDir(), "messages"),

  /**
   * Conversation threads directory
   * Contains full email/LinkedIn conversation histories
   */
  threads: path.join(getDataDir(), "threads"),

  /**
   * Application settings directory
   * Contains user preferences and configuration
   */
  settings: path.join(getDataDir(), "settings"),
} as const;

/**
 * Ensure a directory exists, creating it if necessary
 * @param dirPath - The directory path to ensure exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  const fs = await import("node:fs/promises");
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Initialize all data directories
 * Creates directories if they don't exist
 */
export async function initializeDataDirs(): Promise<void> {
  await Promise.all([
    ensureDir(dataPaths.exports),
    ensureDir(dataPaths.messages),
    ensureDir(dataPaths.threads),
    ensureDir(dataPaths.settings),
  ]);
}
