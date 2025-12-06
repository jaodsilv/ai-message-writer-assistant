import { ModelInterface, Message } from './ModelInterface';

export class Orchestrator {
  private agents: Map<string, ModelInterface> = new Map();

  constructor() {
  }

  registerAgent(agent: ModelInterface) {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): ModelInterface | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): ModelInterface[] {
    return Array.from(this.agents.values());
  }

  async routeMessage(agentId: string, messages: Message[], context?: any, model?: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent.generateResponse(messages, context, model);
  }

  async broadcastMessage(messages: Message[], context?: any): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const promises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        const response = await agent.generateResponse(messages, context);
        results.set(agent.id, response);
      } catch (error: any) {
        results.set(agent.id, `Error: ${error.message}`);
      }
    });
    await Promise.all(promises);
    await Promise.all(promises);
    return results;
  }

  async getAvailableModels(): Promise<{ value: string; displayName: string }[]> {
    const allModels: { value: string; displayName: string }[] = [];
    for (const agent of this.agents.values()) {
      if (agent.getSupportedModels) {
        try {
          const models = await agent.getSupportedModels();
          allModels.push(...models);
        } catch (error) {
          console.error(`Error fetching models for agent ${agent.id}:`, error);
        }
      }
    }
    return allModels;
  }
}
