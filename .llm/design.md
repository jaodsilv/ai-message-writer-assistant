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

## Development Stages & Project Management

### Project Tracking
- **GitHub Project**: [AI Message Writer Assistant](https://github.com/users/jaodsilv/projects/3)
- **Issue Tracking**: All features tracked as GitHub issues ([#12-#30](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
- **Automated Workflow**: GitHub Actions for issue/PR management
- **Phase-Based Development**: 5 development phases with 19 tracked issues

### Stage 1: Minimal Features (MVP) ✅ **COMPLETED**
- Basic AI message generation
- Simple text input/output
- Copy to clipboard
- Basic tone selection

### Stage 2: Current Features ✅ **COMPLETED**
- Multi-platform support (Email, LinkedIn, Support, Custom)
- Context awareness with conversation history
- 6 tone options (Professional, Warm, Concise, Formal, Casual, Persuasive)
- Internationalization (English/Spanish)
- Keyboard shortcuts (Cmd/Ctrl + Enter)

### Stage 3: Planned Features → **Phase 1-3 Development**
- Import/export messages ([#26](https://github.com/jaodsilv/ai-message-writer-assistant/issues/26))
- Thread division and summarization ([#22](https://github.com/jaodsilv/ai-message-writer-assistant/issues/22))
- Email auto-fetch with filtering ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Signature management system ([#23](https://github.com/jaodsilv/ai-message-writer-assistant/issues/23))
- Message/thread CRUD operations ([#21](https://github.com/jaodsilv/ai-message-writer-assistant/issues/21))
- UI mode switching ([#24](https://github.com/jaodsilv/ai-message-writer-assistant/issues/24))
- Dark/light mode toggle ([#15](https://github.com/jaodsilv/ai-message-writer-assistant/issues/15))
- Manual thread creation ([#22](https://github.com/jaodsilv/ai-message-writer-assistant/issues/22))

### Stage 4: Advanced Features → **Phase 4-5 Development**
- Follow-up automation with scheduling ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- LinkedIn connection tracking ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Recruiter relationship management ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Salary negotiation assistant ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Reference request automation ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Thank you note generator ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Network warm-up tools ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Professional achievement tracker ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))

### Stage 5: Unplanned Features (Future Expansion)
- Multi-user support with authentication
- Cloud hosting and data synchronization
- Advanced security features
- Team collaboration tools
- Analytics and insights
- API marketplace integration

## Planned Folder Structure (Future Implementation)

*Note: This structure represents the planned organization after full development. Current structure is documented in CLAUDE.md.*

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

## GitHub Actions Automation

### Workflow Files
- `.github/workflows/add-issues-to-project.yml` - Auto-add issues to project board
- `.github/workflows/add-prs-to-project.yml` - Auto-add PRs to project board  
- `.github/workflows/project-automation.yml` - Status automation (Todo → In Progress → Done)

### Issue Templates
- `.github/ISSUE_TEMPLATE/enhancement.yml` - Structured enhancement requests
- `.github/ISSUE_TEMPLATE/bug_report.yml` - Comprehensive bug reports

### Automation Features
1. **Auto-Project Addition**: Issues/PRs with `enhancement`, `feature`, `bug` labels
2. **Priority Setting**: Based on `critical`, `high`, `medium`, `low` labels
3. **Phase Categorization**: Using `phase-1` through `phase-5` labels
4. **Status Updates**: Automatic status changes on close/merge/reopen
5. **Template Integration**: Structured forms trigger automation

### Setup Requirements
- **Personal Access Token**: Classic token with `repo` + `write:org` scopes
- **Repository Secret**: `ADD_TO_PROJECT_PAT` for workflow authentication
- **Label Management**: Consistent labeling for automation triggers

**TODO**: Add system architecture diagrams showing data flow and component relationships

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
