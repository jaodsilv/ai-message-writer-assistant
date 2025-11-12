# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Output Formatting Preferences
- Always use numbered lists instead of bullet points when listing items
- Use markdown extended formatting for lists and enumerations (see https://www.markdownguide.org/extended-syntax/ if needed)
- Use numbers (1., 2., 3.) for all lists and enumerations
- Use tree structure for nested lists and enumerations

## Application Purpose

AI Message Writer Assistant is designed to help with communication across three main areas:
1. **Job Hunt Communications**: Professional outreach, follow-ups, and networking with companies
2. **Friends**: Personal messaging with appropriate tone and context
3. **Family**: Warm, personal communications maintaining relationships

## Frequently Used Commands

### Development
- `npm run dev` - Start development server with HMR (available at http://localhost:5173)
- `npm run build` - Build production application
- `npm run start` - Start production server from build
- `npm run typecheck` - Run TypeScript type checking and generate types

### Git
- `git add <file>` - Stage a file
- `git commit -m "<commit message>"` - Commit changes
- `git push` - Push changes to remote repository
- `git pull` - Pull changes from remote repository
- `git switch -c <branch-name>` - Create a new branch
- `git switch <branch-name>` - Switch to a branch
- `git branch --show-current` - Show current branch
- `git branch -d <branch-name>` - Delete a branch
- `git status` - List all branches (local and remote)
- `git diff HEAD` - Merge a branch into the current branch

### Github
- `gh issue view <issue-number>` - View an issue
- `gh issue create --title "<title>" --body "<body>"` - Create an issue
- `gh issue list` - List all issues
- `gh issue comment <issue-number> --body "<body>"` - Comment on an issue
- `gh issue close <issue-number>` - Close an issue
- `gh pr create -a @me -l <labels> -T <template> --title "<title>" --body "<body>"` - Create a pull request
- `gh pr list` - List all pull requests
- `gh pr view <pr-number> -c --json "comments" --jq '.comments | map(select(.author.login == "claude")) | last | { id: .id, author: .author.login, body: .body, isMinimized: .isMinimized }'` - Get the latest PR comment from Claude
- `gh pr merge <pr-number>` - Merge a pull request
- `gh pr close <pr-number>` - Close a pull request
- `gh api --method PATCH /repos/jaodsilv/ai-message-writer-assistant/pulls/comments/<comment-id> -f "minimizedReason=RESOLVED" -f 'isMinimized=true'` - Mark a pull request comment as resolved

### Claude
- `claude -p "/<slash-command>"` - Execute a slash command
- `claude -p "/<slash-command> <arguments>"` - Execute a slash command with arguments

#### Custom Slash Commands
- `/add-task <Optional [TaskIndex]|[Github Issue Number]> <TaskDescription>` - Add a new task to the @.llm/todo.md file
- `/address-pr-comment <PRNumber> <CommentID> <action>` - Address a PR comment by trying to fix a problem pointed in a PR comment
- `/check-last-pr-comment <PRNumber>` - Parse the last PR comment from Claude and list suggestions for required and/or optional changes
- `/clean-all-comments` - Scan repo for comments that chould be cleaned up and remove them
- `/clean-comments` - Scan and edit local code changes that are not yet committed to git and remove comments that are not needed
- `/commit-push <Optional: Context>` - Commit and push changes to the current branch
- `/commit <Optional: Context>` - Commit changes to the current branch
- `/create-pr <Optional: Context>` - Create a pull request
- `/execute-plan <TaskIndex>` - Execute the plan for a task
- `/execute-step <StepIndex>` - Execute the next step in the current ongoing plan
- `/new-branch <TaskIndex>` - Create a new branch for a task
- `/plan` - Plan a task in the .llm/todo.md file
- `/switch-master` - Switch to the master branch and delete previous branch
- `/worktree <TaskIndex>` - Create a worktree for a task

## Environment Setup
- Requires `.env` file with `ANTHROPIC_API_KEY=your_api_key_here`
- Never commit `.env` file (already in `.gitignore`)

## GitHub Project Management
- **Project Board**: [AI Message Writer Assistant](https://github.com/users/jaodsilv/projects/3)
- **Development Plan**: See `.llm/todo.md` for detailed roadmap with issue links
- **Issue Creation**: Use GitHub issue templates for consistent reporting
- **Automation**: GitHub Actions automatically add labeled issues/PRs to project board

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

#### Current Features
1. **AI Message Generation**: Transform raw thoughts into polished messages ✅
   - [x] **Validated**: Claude API integration works correctly
   - [x] **Validated**: Tone selection affects AI output
   - [x] **Validated**: Context input influences AI generation
2. **Context Awareness**: Support for conversation history and context ✅
   - [x] **Validated**: Context input influences AI generation
3. **Multi-Platform**: Email, LinkedIn, support tickets, custom platforms
   - [ ] **Validation Required**: Verify platform selection affects formatting
4. **Tone Customization**: Six different tone options ✅
   - [x] **Validated**: Tone selection affects AI output
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

## Development Notes
- Uses React Router v7 with file-based routing
- Tailwind CSS configured with Vite plugin for optimal performance
- TypeScript configured with strict mode and path aliases (`~/` → `./app/`)
- Global Claude API interface declared in `app/types.ts`
- Error boundaries configured in `app/root.tsx`

### Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

### Security Considerations
- API keys loaded from environment variables only
- No hardcoded credentials in source code
- `.env` file excluded from version control
- **API Key Validation**: Verify API key format and test connectivity on startup
- **Error Handling**: Implement graceful handling of API failures and rate limits
- **API Key Rotation**: Update `.env` file when rotating keys, restart application to apply changes

### Testing and Linting
- ESLint configured with React app presets
- TypeScript type checking via `npm run typecheck`
- **Testing Framework**: Vitest + React Testing Library (to be configured in Phase 1)
- **Test Coverage Target**: >80% coverage for production readiness
- **Testing Strategy**: TDD for any task associated to a GitHub issue. Unit tests for components/hooks, integration tests for workflows, E2E tests for critical paths.

### Development Workflow
- **Issue Tracking**: All features tracked as GitHub issues linked to development phases
- **Project Management**: Automated GitHub Actions workflow for issue/PR management
- **Phase-Based Development**: See issues [#12-#30](https://github.com/jaodsilv/ai-message-writer-assistant/issues) for detailed implementation plan
- **Priority Levels**: Critical → High → Medium → Low (automatically set via issue labels)
- **Status Automation**: Issues/PRs automatically move through Todo → In Progress → Done states
- **Typechecking**: Be sure to typecheck when you’re done making a series of code changes
- **Testing**: Prefer running single tests, and not the whole test suite, for performance

### Git Commit Guidelines
- **Focused Commits**: Only commit files directly related to your current task or change
- **Staging Discipline**: Use `git add` selectively to stage only relevant files, not `git add .`
- **Unrelated Changes**: Keep unrelated changes (testing files, config updates, etc.) in separate commits
- **Clean History**: If you accidentally stage unrelated files, use `git restore --staged <file>` to unstage them
- **Commit Scope**: Each commit should represent a single, cohesive change that can be reviewed independently
- **Authoring**: Do NOT add co-authors to the commit message.

### Git Branch naming convention
- Use a meaningful name based on the Task Description and task type, follow the format `<type>/<task-id>-<meaningful-name>`.
- Use the following types for the `<type>`:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for test additions/changes
  - `chore:` for maintenance tasks