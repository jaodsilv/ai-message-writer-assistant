import { MemoryManager } from '../agents/MemoryManager';
import { Orchestrator } from '../agents/Orchestrator';
import { FileRepository } from './FileRepository';
import { MessageParserService } from './MessageParserService';
import { UndoService } from './UndoService';
import { ClaudeAgent } from '../agents/ClaudeAgent';
import path from 'path';

// Singleton instances
let memoryManager: MemoryManager;
let orchestrator: Orchestrator;
let fileRepository: FileRepository;
let messageParser: MessageParserService;
let undoService: UndoService;

export function getServices() {
  if (!memoryManager) {
    const dataDir = path.resolve(process.cwd(), 'data');
    fileRepository = new FileRepository(dataDir);
    memoryManager = new MemoryManager(fileRepository);
    orchestrator = new Orchestrator();
    messageParser = new MessageParserService();
    undoService = new UndoService();

    // Initialize agents
    orchestrator.registerAgent(new ClaudeAgent());
  }

  return {
    memoryManager,
    orchestrator,
    fileRepository,
    messageParser,
    undoService
  };
}
