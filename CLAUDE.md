# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Output Formatting Preferences

1. Always use numbered lists instead of bullet points when listing items
2. Use numbers (1., 2., 3.) for all lists and enumerations

## Application Purpose

AI Message Writer Assistant is a multi-agentic, multi-model AI assistant designed to help craft professional communications, with a focus on:

1. **Job Hunt Communications**: Professional outreach, follow-ups, recruiter communications, and networking
2. **Work Communications**: Professional emails and messages for workplace scenarios
3. **Personal Communications**: Messages for friends and family with appropriate tone

## Common Commands

### Development

1. `npm run dev` - Start Next.js development server (http://localhost:3000)
2. `npm run build` - Build production application
3. `npm run start` - Start production server
4. `npm run lint` - Run ESLint
5. `npm run typecheck` - Run TypeScript type checking
6. `npm run test` - Run Vitest tests
7. `npm run test:e2e` - Run Playwright E2E tests

### Environment Setup

Required environment variables (see `.env.example`):

1. `JWT_SECRET` - Secret key for JWT authentication
2. `ANTHROPIC_API_KEY` - Claude API key (required)
3. `OPENAI_API_KEY` - OpenAI API key (optional)
4. `GOOGLE_AI_API_KEY` - Gemini API key (optional)
5. `GROQ_API_KEY` - Groq API key (optional)
6. `MISTRAL_API_KEY` - Mistral API key (optional)
7. `COHERE_API_KEY` - Cohere API key (optional)

## Architecture Overview

### Tech Stack

1. **Framework**: Next.js 15 with App Router
2. **Language**: TypeScript (strict mode)
3. **Styling**: Tailwind CSS v3 with Radix UI components
4. **Authentication**: JWT with bcrypt
5. **Storage**: Encrypted YAML files (git-crypt)
6. **LLM Providers**: Claude, OpenAI, Gemini, Groq, Mistral, Cohere
7. **Testing**: Vitest, React Testing Library, Playwright

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── (dashboard)/              # Protected dashboard routes
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── generate/             # Message generation
│       ├── compare/              # Multi-model comparison
│       └── debug/                # Debug endpoints
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── conversation/             # Conversation components
│   ├── compose/                  # Message composition
│   ├── compare/                  # Model comparison
│   └── debug/                    # Debug visualizations
│
├── lib/                          # Core libraries
│   ├── agents/                   # Multi-agent system
│   │   ├── orchestrator.ts       # Main orchestrator
│   │   ├── context-analyzer.ts   # Context analysis
│   │   ├── tone-calibrator.ts    # Tone calibration
│   │   ├── content-generator.ts  # Content generation
│   │   ├── platform-formatter.ts # Platform formatting
│   │   ├── quality-reviewer.ts   # Quality review
│   │   ├── job-hunting-specialist.ts
│   │   ├── memory-manager.ts
│   │   └── result-combiner.ts
│   ├── providers/                # LLM provider clients
│   ├── storage/                  # File-based storage
│   ├── auth/                     # Authentication utilities
│   ├── comparison/               # Multi-model comparison
│   └── debug/                    # Debug utilities
│
├── types/                        # TypeScript type definitions
└── styles/                       # Global styles
```

### Multi-Agent System

The application uses a multi-agent architecture for message generation:

1. **Orchestrator**: Coordinates all agents and manages execution flow
2. **Context Analyzer**: Extracts intent, entities, and sentiment from input
3. **Tone Calibrator**: Calibrates appropriate tone for the message
4. **Content Generator**: Generates the main message content
5. **Platform Formatter**: Formats for specific platforms (email, LinkedIn, etc.)
6. **Quality Reviewer**: Reviews grammar, clarity, and professionalism
7. **Job Hunting Specialist**: Provides job-specific strategic advice
8. **Memory Manager**: Manages conversation memory and context
9. **Result Combiner**: Combines all agent outputs into final result

### Multi-Model Comparison

The system supports parallel generation across multiple LLM providers:

1. Claude (Anthropic)
2. GPT-4 (OpenAI)
3. Gemini (Google)
4. Llama (Groq)
5. Mistral
6. Command (Cohere)

Users can generate responses from all configured providers simultaneously and vote for the best result.

### Security Considerations

1. API keys stored in environment variables only
2. JWT authentication with bcrypt password hashing
3. Data encrypted using git-crypt
4. Security headers configured in Next.js
5. Input validation using Zod schemas

### Accessibility Features

Designed for neurodivergent users (dyslexia, ADHD, autism):

1. Clean, uncluttered layouts
2. High contrast mode option
3. Dyslexia-friendly font options
4. Adjustable spacing
5. Reduced motion option
6. Focus mode
7. Keyboard shortcuts
8. Clear visual hierarchy

### Testing Strategy

1. Unit tests for components and utilities
2. Integration tests for API routes
3. E2E tests for critical user flows
4. Target: >80% code coverage

### Development Workflow

1. Follow the coding task workflow in `.claude/shared/coding-task-workflow.md`
2. Use TDD approach for new features
3. All features tracked as GitHub issues
4. PR reviews required before merge
