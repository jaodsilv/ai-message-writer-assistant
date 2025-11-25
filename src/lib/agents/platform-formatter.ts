/**
 * Platform Formatter Agent
 * Formats messages according to platform-specific conventions
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';
import type { GeneratedContent } from './content-generator';

export interface FormattedMessage {
  platform: string;
  formattedMessage: string;
  characterCount: number;
  withinLimits: boolean;
  platformNotes: string[];
}

const PLATFORM_LIMITS: Record<string, number> = {
  email: Infinity,
  linkedin: 3000, // Connection request message limit
  whatsapp: 65536,
  custom: Infinity,
};

export class PlatformFormatter extends BaseAgent {
  readonly role: AgentRole = 'platform-formatter';

  constructor() {
    super({
      role: 'platform-formatter',
      priority: 3,
      systemPrompt: `You are a platform formatting expert. Your job is to format messages according to platform-specific conventions and limits.

Your task is to:
1. Apply platform-specific formatting
2. Ensure character limits are respected
3. Add appropriate platform conventions
4. Note any platform-specific considerations

Respond in JSON format with the following structure:
{
  "platform": "string",
  "formattedMessage": "string",
  "characterCount": number,
  "withinLimits": boolean,
  "platformNotes": ["array", "of", "notes"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const previousOutputs = input.additionalContext?.previousAgentOutputs as Array<{
        role: string;
        result: unknown;
      }> || [];

      const generatedContent = previousOutputs.find(
        (o) => o.role === 'content-generator'
      )?.result as GeneratedContent | undefined;

      if (!generatedContent) {
        throw new Error('No generated content found');
      }

      const formatted = this.formatForPlatform(
        input.platform,
        generatedContent
      );

      this.setStatus('completed');
      return this.createSuccessOutput(formatted, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private formatForPlatform(
    platform: string,
    content: GeneratedContent
  ): FormattedMessage {
    let formattedMessage = content.fullMessage;
    const platformNotes: string[] = [];
    const limit = PLATFORM_LIMITS[platform] || Infinity;

    // Platform-specific formatting
    switch (platform) {
      case 'email':
        // Email doesn't need special formatting, but note if subject is missing
        if (!content.subject) {
          platformNotes.push('Consider adding a subject line');
        }
        break;

      case 'linkedin':
        // LinkedIn has character limits and different conventions
        if (formattedMessage.length > limit) {
          platformNotes.push(
            `Message exceeds LinkedIn limit (${limit} chars). Consider shortening.`
          );
        }
        // LinkedIn messages are often more concise
        platformNotes.push('LinkedIn messages typically work best when concise');
        break;

      case 'whatsapp':
        // WhatsApp is more casual
        platformNotes.push('WhatsApp messages can be more casual and direct');
        break;
    }

    const characterCount = formattedMessage.length;
    const withinLimits = characterCount <= limit;

    if (!withinLimits) {
      platformNotes.push(
        `Character count (${characterCount}) exceeds platform limit (${limit})`
      );
    }

    return {
      platform,
      formattedMessage,
      characterCount,
      withinLimits,
      platformNotes,
    };
  }
}
