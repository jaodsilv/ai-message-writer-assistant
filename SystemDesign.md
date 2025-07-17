# System Design

## Architecture Overview

The AI Message Writer Assistant follows a 5-stage development approach, currently scoped for personal use with future expansion capabilities.

### Technology Stack
- **Frontend**: React Router v7 with SSR, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **AI Integration**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library (planned)
- **State Management**: LocalStorage + React Context
- **Theme**: next-themes (for dark/light mode)

## Development Stages

### Stage 1: Minimal Features (MVP)
- Basic AI message generation
- Simple text input/output
- Copy to clipboard
- Basic tone selection

### Stage 2: Current Features
- Multi-platform support (Email, LinkedIn, Support, Custom)
- Context awareness with conversation history
- 6 tone options (Professional, Warm, Concise, Formal, Casual, Persuasive)
- Internationalization (English/Spanish)
- Keyboard shortcuts (Cmd/Ctrl + Enter)

### Stage 3: Planned Features
- Import/export messages (File API)
- Thread division and summarization
- Email auto-fetch with filtering (Gmail API)
- Signature management system
- Message/thread CRUD operations
- UI mode switching (Single Page vs Wizard)
- Dark/light mode toggle
- Manual thread creation

### Stage 4: Suggested Features (Job Hunt Focus)
- Follow-up automation with scheduling
- LinkedIn connection tracking
- Recruiter relationship management
- Salary negotiation assistant
- Reference request automation
- Thank you note generator
- Network warm-up tools
- Professional achievement tracker

### Stage 5: Unplanned Features (Future Expansion)
- Multi-user support with authentication
- Cloud hosting and data synchronization
- Advanced security features
- Team collaboration tools
- Analytics and insights
- API marketplace integration

## Folder Structure

```
app/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   ├── forms/           # Form components
│   │   ├── message-form.tsx
│   │   ├── signature-form.tsx
│   │   └── thread-form.tsx
│   ├── message/         # Message-related components
│   │   ├── message-card.tsx
│   │   ├── message-list.tsx
│   │   └── message-editor.tsx
│   ├── thread/          # Thread-related components
│   │   ├── thread-card.tsx
│   │   ├── thread-list.tsx
│   │   └── thread-summarizer.tsx
│   └── layout/          # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── theme-toggle.tsx
├── claude-api/          # Claude API integration
│   ├── claude-api.tsx
│   ├── claude-message-writer.tsx
│   ├── claude-thread-summarizer.tsx
│   └── prompts.tsx
├── hooks/               # Custom React hooks
│   ├── use-local-storage.tsx
│   ├── use-clipboard.tsx
│   ├── use-keyboard-shortcuts.tsx
│   └── use-theme.tsx
├── lib/                 # Utility libraries
│   ├── storage.ts       # LocalStorage utilities
│   ├── export.ts        # Import/export utilities
│   ├── validation.ts    # Form validation
│   └── utils.ts         # General utilities
├── routes/              # Route components
│   ├── home.tsx         # Main application
│   ├── messages.tsx     # Message management
│   ├── threads.tsx      # Thread management
│   └── settings.tsx     # Settings page
├── stores/              # State management
│   ├── message-store.tsx
│   ├── thread-store.tsx
│   └── settings-store.tsx
├── types/               # TypeScript definitions
│   ├── message.ts
│   ├── thread.ts
│   ├── signature.ts
│   └── settings.ts
├── root.tsx             # Root layout
├── routes.ts            # Route configuration
└── app.css              # Global styles

tests/                   # Test files
├── components/
│   ├── ui/
│   ├── forms/
│   ├── message/
│   └── thread/
├── claude-api/
├── hooks/
├── lib/
└── routes/

docs/                    # Documentation
├── api.md
├── architecture.md
└── deployment.md
```

## Key Files to be Created

### Core Components
- `app/components/ui/` - Base UI component library
- `app/components/forms/message-form.tsx` - Main message creation form
- `app/components/message/message-editor.tsx` - Rich text editor
- `app/components/layout/theme-toggle.tsx` - Dark/light mode switch

### State Management
- `app/stores/message-store.tsx` - Message state management
- `app/stores/thread-store.tsx` - Thread state management
- `app/hooks/use-local-storage.tsx` - LocalStorage hook

### Utilities
- `app/lib/storage.ts` - Data persistence utilities
- `app/lib/export.ts` - Import/export functionality
- `app/lib/validation.ts` - Form validation schemas

### Routes
- `app/routes/messages.tsx` - Message management interface
- `app/routes/threads.tsx` - Thread management interface
- `app/routes/settings.tsx` - Application settings

### Testing
- `tests/components/` - Component tests
- `tests/hooks/` - Hook tests
- `tests/lib/` - Utility tests
- `vitest.config.ts` - Test configuration

### Documentation
- `docs/api.md` - API documentation
- `docs/architecture.md` - System architecture
- `docs/deployment.md` - Deployment guide

## Technology Recommendations

### Current Implementation
- **State Management**: React Context + LocalStorage
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library
- **Theme**: next-themes
- **Forms**: React Hook Form + Zod validation

### Future Expansion Technologies
- **Authentication**: Auth0 or Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Vercel or Netlify
- **API Integration**: tRPC or GraphQL
- **Real-time**: WebSockets or Server-Sent Events

## Personal Use Scope

Currently designed for single-user personal use with:
- Local data storage (LocalStorage)
- Client-side only processing
- No user authentication required
- Portable configuration export/import
- Offline-first approach

Future expansion will include multi-user support, cloud synchronization, and enterprise features.

Built with ❤️ using React Router and Anthropic Claude API.
