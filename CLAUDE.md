# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Purpose

AI Message Writer Assistant is designed to help with communication across three main areas:
1. **Job Hunt Communications**: Professional outreach, follow-ups, and networking with companies
2. **Friends**: Personal messaging with appropriate tone and context
3. **Family**: Warm, personal communications maintaining relationships

## Common Commands

### Development
- `npm run dev` - Start development server with HMR (available at http://localhost:5173)
- `npm run build` - Build production application
- `npm run start` - Start production server from build
- `npm run typecheck` - Run TypeScript type checking and generate types

### Environment Setup
- Requires `.env` file with `ANTHROPIC_API_KEY=your_api_key_here`
- Never commit `.env` file (already in `.gitignore`)

## Architecture Overview

### Tech Stack
- **Framework**: React Router v7 with SSR capabilities
- **Styling**: Tailwind CSS v4 with Vite plugin
- **TypeScript**: Strict mode enabled
- **AI Integration**: Anthropic Claude API via `@anthropic-ai/sdk`
- **Icons**: Lucide React
- **Build Tool**: Vite

### Project Structure
```
app/
├── claude-api/           # Claude API integration modules
│   ├── claude-api.tsx   # Core API client configuration
│   ├── claude-message-writer.tsx
│   ├── claude-thread-summarizer.tsx
│   └── prompts.tsx
├── routes/
│   └── home.tsx         # Main application UI
├── root.tsx             # Root layout component
├── routes.ts            # Route configuration
├── types.ts             # TypeScript type definitions
└── app.css              # Global styles
```

### Key Components and Architecture

#### Claude API Integration
The application integrates with Anthropic's Claude API through a structured approach:

- **API Client**: `app/claude-api/claude-api.tsx` contains the main Anthropic SDK configuration
- **Message Writer**: Core functionality for AI-powered message generation
- **Thread Summarizer**: Handles conversation context and summarization
- **Prompt Engineering**: Structured prompts with examples and tool definitions

#### Application State and Types
- `app/types.ts` defines comprehensive interfaces for:
  - `SavedMessage`: Complete message data structure
  - `ManualEntry`: Manual conversation entries
  - `Signatures`: Platform-specific signatures
  - `Tone`, `Platform`, `MessageMode`: Configuration options
  - Global `window.claude` API interface

#### UI Architecture
- **Single Page Application**: Main functionality in `app/routes/home.tsx`
- **Component Structure**: Large functional component with multiple UI sections
- **Internationalization**: Built-in translation system with English and Spanish support
- **Platform Support**: Email, LinkedIn, Support tickets, Custom platforms
- **Tone Selection**: Professional, Warm, Concise, Formal, Casual, Persuasive

### Key Features

#### Current Features (⚠️ Validation Required)
1. **AI Message Generation**: Transform raw thoughts into polished messages
   - [ ] **Validation Required**: Test if Claude API integration actually works
   - [ ] **Validation Required**: Verify if tone selection affects AI output
   - [ ] **Validation Required**: Test if context input influences AI generation
2. **Context Awareness**: Support for conversation history and context
   - [ ] **Validation Required**: Check if context input influences AI generation
3. **Multi-Platform**: Email, LinkedIn, support tickets, custom platforms
   - [ ] **Validation Required**: Verify platform selection affects formatting
4. **Tone Customization**: Six different tone options
   - [ ] **Validation Required**: Verify if tone selection affects AI output
5. **Internationalization**: Multi-language support
   - [ ] **Validation Required**: Check if translation system switches languages
6. **Copy-to-Clipboard**: Built-in clipboard functionality
   - [ ] **Validation Required**: Test copy-to-clipboard functionality
7. **Keyboard Shortcuts**: Cmd/Ctrl + Enter for generation
   - [ ] **Validation Required**: Validate keyboard shortcuts (Cmd/Ctrl + Enter)

#### Planned Features
1. **Import/Export Messages**: Bulk message management and backup
2. **Thread Division**: Split conversations into logical segments
3. **Thread Summarization**: AI-powered conversation summaries
4. **Email Auto-Fetch with Topic Filtering**: Automated email retrieval with smart filtering
5. **Import/Export Signatures**: Separate signature management system
6. **Draft Saving in Gmail**: Direct Gmail integration for draft management
7. **Stored Messages Filtering**: Filter by person (To/CC/From), Company, conversation ID
8. **Single Page vs Wizard Mode Switch**: Toggle between UI modes
9. **Manual Message Creation**: Add messages to history manually
10. **Edit Stored Messages**: Modify saved messages
11. **Delete Stored Messages**: Remove individual messages
12. **Delete Stored Threads**: Remove entire conversation threads
13. **Manual Thread Import/Creation**: Single-step thread creation
14. **API-Based Thread Import**: Automated thread creation from APIs
15. **API Integrations**: Gmail, LinkedIn, WhatsApp connectivity
16. **Dark Mode vs Light Mode Switch**: Toggle between light and dark themes

#### Additional Job Hunt Communication Features (Recommended)
1. **Follow-up Automation**: Automated follow-up scheduling and reminders
2. **LinkedIn Connection Tracker**: Track connection requests and responses
3. **Recruiter Relationship Management**: Maintain recruiter contact history
4. **Salary Negotiation Assistant**: Generate negotiation messages and strategies
5. **Reference Request Automation**: Streamline reference request process
6. **Thank You Note Generator**: Post-interview thank you message automation
7. **Network Warm-Up**: Re-engage dormant professional connections
8. **Professional Achievement Tracker**: Maintain accomplishment database for easy reference

### Development Notes
- Uses React Router v7 with file-based routing
- Tailwind CSS configured with Vite plugin for optimal performance
- TypeScript configured with strict mode and path aliases (`~/` → `./app/`)
- Global Claude API interface declared in `app/types.ts`
- Error boundaries configured in `app/root.tsx`

### Security Considerations
- API keys loaded from environment variables only
- No hardcoded credentials in source code
- `.env` file excluded from version control
- Client-side API calls through global `window.claude` interface
- **API Key Validation**: Verify API key format and test connectivity on startup
- **Error Handling**: Implement graceful handling of API failures and rate limits
- **API Key Rotation**: Update `.env` file when rotating keys, restart application to apply changes

### Testing and Linting
- ESLint configured with React app presets
- TypeScript type checking via `npm run typecheck`
- **Testing Framework**: Vitest + React Testing Library (to be configured in Phase 1)
- **Test Coverage Target**: >80% coverage for production readiness
- **Testing Strategy**: Unit tests for components/hooks, integration tests for workflows, E2E tests for critical paths