/**
 * Voting System
 * Tracks user votes for model comparison results
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ProviderName, ComparisonResult } from '@/types/provider';

export interface Vote {
  userId: string;
  comparisonId: string;
  winner: ProviderName;
  timestamp: string;
  context?: {
    prompt: string;
    scenario: string;
    tone: string;
  };
}

export interface VoteStatistics {
  totalVotes: number;
  votesByProvider: Record<ProviderName, number>;
  winRateByProvider: Record<ProviderName, number>;
  recentWinner: ProviderName | null;
}

interface VoteStore {
  votes: Vote[];
  lastUpdated: string;
}

function getDataPath(): string {
  return process.env.DATA_PATH || './data';
}

function getVotesFilePath(): string {
  return path.join(getDataPath(), 'votes.yaml');
}

async function ensureDataDir(): Promise<void> {
  const dataPath = getDataPath();
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true });
  }
}

async function loadVotes(): Promise<VoteStore> {
  const filePath = getVotesFilePath();

  if (!existsSync(filePath)) {
    return {
      votes: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as VoteStore;
}

async function saveVotes(store: VoteStore): Promise<void> {
  await ensureDataDir();
  const filePath = getVotesFilePath();
  const content = yaml.dump(store, { lineWidth: -1 });
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Record a vote for a comparison result
 */
export async function recordVote(vote: Omit<Vote, 'timestamp'>): Promise<Vote> {
  const store = await loadVotes();

  const newVote: Vote = {
    ...vote,
    timestamp: new Date().toISOString(),
  };

  store.votes.push(newVote);
  store.lastUpdated = newVote.timestamp;

  await saveVotes(store);
  return newVote;
}

/**
 * Get voting statistics
 */
export async function getVoteStatistics(
  userId?: string,
  limit?: number
): Promise<VoteStatistics> {
  const store = await loadVotes();

  let votes = store.votes;

  // Filter by user if specified
  if (userId) {
    votes = votes.filter((v) => v.userId === userId);
  }

  // Limit to recent votes if specified
  if (limit) {
    votes = votes.slice(-limit);
  }

  // Calculate statistics
  const votesByProvider: Record<string, number> = {};
  const providers = new Set<ProviderName>();

  for (const vote of votes) {
    providers.add(vote.winner);
    votesByProvider[vote.winner] = (votesByProvider[vote.winner] || 0) + 1;
  }

  // Calculate win rates
  const totalVotes = votes.length;
  const winRateByProvider: Record<string, number> = {};

  for (const provider of providers) {
    const wins = votesByProvider[provider] || 0;
    winRateByProvider[provider] = totalVotes > 0 ? wins / totalVotes : 0;
  }

  // Find recent winner
  const recentVotes = votes.slice(-10);
  const recentCounts: Record<string, number> = {};

  for (const vote of recentVotes) {
    recentCounts[vote.winner] = (recentCounts[vote.winner] || 0) + 1;
  }

  let recentWinner: ProviderName | null = null;
  let maxRecentVotes = 0;

  for (const [provider, count] of Object.entries(recentCounts)) {
    if (count > maxRecentVotes) {
      maxRecentVotes = count;
      recentWinner = provider as ProviderName;
    }
  }

  return {
    totalVotes,
    votesByProvider: votesByProvider as Record<ProviderName, number>,
    winRateByProvider: winRateByProvider as Record<ProviderName, number>,
    recentWinner,
  };
}

/**
 * Update a comparison result with the winner
 */
export function setComparisonWinner(
  result: ComparisonResult,
  winner: ProviderName
): ComparisonResult {
  const votes: Partial<Record<ProviderName, number>> = {};

  for (const r of result.results) {
    votes[r.metadata.provider] = r.metadata.provider === winner ? 1 : 0;
  }

  return {
    ...result,
    winner,
    votes: votes as Record<ProviderName, number>,
  };
}

/**
 * Get user's voting history
 */
export async function getUserVotingHistory(
  userId: string,
  limit: number = 50
): Promise<Vote[]> {
  const store = await loadVotes();

  return store.votes
    .filter((v) => v.userId === userId)
    .slice(-limit)
    .reverse();
}
