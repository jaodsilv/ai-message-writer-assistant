# AI Message Writer Assistant

[![Add Issues to Project](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/add-issues-to-project.yml/badge.svg)](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/add-issues-to-project.yml)
[![Add PRs to Project](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/add-prs-to-project.yml/badge.svg)](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/add-prs-to-project.yml)
[![Project Automation](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/project-automation.yml/badge.svg)](https://github.com/jaodsilv/ai-message-writer-assistant/actions/workflows/project-automation.yml)

A personal AI-powered communication assistant designed for job hunt, friends, and family messaging using Anthropic's Claude API. Built with React Router v7, TypeScript, and Tailwind CSS.

## Features

### Current Features
- **AI Message Generation**: Transform raw thoughts into polished messages
- **Multi-Platform Support**: Email, LinkedIn, support tickets, custom platforms
- **Tone Customization**: Six different tone options (Professional, Warm, Concise, Formal, Casual, Persuasive)
- **Context Awareness**: Support for conversation history and context
- **Internationalization**: Multi-language support (English/Spanish)
- **Copy-to-Clipboard**: Built-in clipboard functionality
- **Keyboard Shortcuts**: Cmd/Ctrl + Enter for quick generation

### Planned Features
- Import/export messages and signatures ([#26](https://github.com/jaodsilv/ai-message-writer-assistant/issues/26))
- Thread division and summarization ([#22](https://github.com/jaodsilv/ai-message-writer-assistant/issues/22))
- Email auto-fetch with filtering ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))
- Message/thread CRUD operations ([#21](https://github.com/jaodsilv/ai-message-writer-assistant/issues/21))
- Dark/light mode toggle ([#15](https://github.com/jaodsilv/ai-message-writer-assistant/issues/15))
- Job hunt automation tools ([#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues/27))

## Getting Started

### Prerequisites

You'll need an Anthropic API key to use this application. Get one from [Anthropic Console](https://console.anthropic.com/).

### Environment Setup

1. Create a `.env` file in the root directory of the project
2. Add your Anthropic API key to the file:

```bash
ANTHROPIC_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your `.env` file to version control. It's already added to `.gitignore` to prevent accidental commits.

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Build Commands

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm run start
```

Type checking:
```bash
npm run typecheck
```

## Development Workflow

### Project Management
- **Project Board**: [AI Message Writer Assistant](https://github.com/users/jaodsilv/projects/3)
- **Development Plan**: See [DEV_PLAN.md](DEV_PLAN.md) for detailed roadmap
- **Issue Templates**: Use GitHub issue templates for consistent reporting
- **Automation**: GitHub Actions automatically manage issues and PRs

### Contributing
1. **Create Issues**: Use provided templates for bugs and enhancements
2. **Label Priority**: Apply priority labels (`critical`, `high`, `medium`, `low`)
3. **Phase Tracking**: Issues are organized by development phases ([#12-#30](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
4. **Automated Workflow**: Issues/PRs automatically added to project board

### Development Phases
- **Phase 1**: Foundation & Validation ([#12-#17](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
- **Phase 2**: State Management & Data Layer ([#18-#20](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
- **Phase 3**: Core Features Implementation ([#21-#23](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
- **Phase 4**: Advanced Features ([#24-#27](https://github.com/jaodsilv/ai-message-writer-assistant/issues))
- **Phase 5**: Polish & Optimization ([#28-#30](https://github.com/jaodsilv/ai-message-writer-assistant/issues))

## Troubleshooting

### Common Issues

**API Key Issues:**
- Ensure your `.env` file exists in the root directory
- Verify your Anthropic API key is valid
- Check that `ANTHROPIC_API_KEY` is spelled correctly in your `.env` file

**Build Issues:**
- Run `npm install` to ensure all dependencies are installed
- Try `npm run typecheck` to identify TypeScript errors
- Clear your browser cache and restart the development server

**Runtime Errors:**
- Check the browser console for error messages
- Verify your Anthropic API key has sufficient credits
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

### Getting Help

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your API key is working by testing it directly with Anthropic's API
3. Ensure all dependencies are installed with `npm install`

## Security Notes

- The `.env` file is excluded from version control via `.gitignore`
- API keys are loaded from environment variables at runtime
- Never hardcode API keys in your source code
- API key rotation: Update your `.env` file when rotating keys


## 🤖 `claude` code configuration

* The config used here was heavily based on Craig Motlin's https://github.com/motlin/claude-code-prompts extracted on 2025-07-23. See his blog post at [Claude Code Utility Commands](https://motlin.com/blog/claude-code-utility-commands) and [Development Workflow with Claude Code](https://motlin.com/blog/claude-code-configuration) for more details, examples and inspiration.
* Changes made to this to fit better my own style and needs.

My development workflow revolves around a markdown todo list and one main custom commands: `/user:dev` for planning, implementing and committing changes.

## 📋 Overview

- **`.llm/todo.md`** - A markdown checklist that persists across sessions
- **`/user:dev`** - Custom command to implement tasks in loop

## 📝 Creating the Task List

I usually let the thinking model augment `.llm/todo.md` with custom commands to implement the tasks by chatting with Claude. I'll use ChatGPT or Gemini or any other model if I feel Claude is not giving me my desired response. Each checkbox represents an atomic piece of work that can be tested and committed independently, and that they ordered by imlpementation order rather than importance. There are non-atomic pieces in my .llm/todo.md, but this means it must be planned in more details yet.

## 🔄 The Development Loop

### 1. 🎯 Work on Next Task

I invoke my todo command:
```
/user:dev
```

This calls `/user:todo` in loop until all tasks are complete.
This supports parallel execution of tasks, i.e., with more than one task running at the same time.
This reads `.llm/todo.md`, finds the next incomplete task, shows me the context, and implements it. Once done, it marks the task as complete.

```markdown
- [x] First task
- [ ] Second task
```

### 2. 💾 Commit the Changes

When I'm happy with the implementation:
```
/user:commit
```

This stages only the files that Claude edited and creates a commit message. My global CLAUDE.md has it run `just precommit` automatically, so tests run before each commit.

### 3. 🔄 Start Fresh or Continue

At this point I peek at the next task and consider whether it's related to the one we just finished.

- If not, I close and reopen Claude to clear context
- If it is, I run `/compact` to compress the conversation and keep the context

I don't use the `/clear` command, I always close and reopen Claude. This avoid out-of-memory errors, and keeps me on the latest Claude Code version, which is released very frequently.

I don't often use `auto-accept edits` but when I do, I forget that it's on. Closing and reopening Claude resets it to off.

After existing, I one-shot the next task with:

```shell-session
$ claude '/user:todo'
```

## 💡 Why This Works for Me

If you're already writing quality GitHub issues, please don't stop. I don't often have the discipline.

The todo.md is a simple way to order and reorder tasks and helps me keep moving. If I learn something new, I can ask Claude to prepend tasks, or completely rework the list.

As I scale up to a whole team of people working with LLMs, I'd like to experiment with getting Claude to convert `todo.md` into GitHub issues.

## 🎬 Real Example

```bash
❯ claude '/user:todo'

> /user:todo is running…

⏺ The previous completed task was:
  - Once the new recipe works well, add it to the just factorio recipe

   The next incomplete task is:
  - Fix search by tag

  This task mentions issue #1137 on GitHub. Let me fetch the details about this issue to understand what needs to be fixed.

⏺ Based on my analysis, I believe I've identified the issue with tag search. The problem appears to be that the code is comparing a plain string
  value from the URL directly against an enum field without proper conversion.

  Plan to Fix Tag Search

  The issue is in ManualBlueprintResource.searchBlueprintSummaries() at lines 283-286. When a tag like /power/nuclear/ is passed:

  1. The code splits it and gets "power" as the category
  2. It tries to compare this string directly with BlueprintFinder.tags().tagCategory().eq("power")
  3. But tagCategory is an enum field (TagCategory), not a string

  The fix is to convert the string to the proper enum value before comparison. We need to:

  1. Parse the category string to the TagCategory enum
  2. Handle case conversion (URL uses lowercase, enum uses uppercase)
  3. Add proper error handling for invalid categories

  Shall I proceed with implementing this fix?

> yes

⏺ I'll implement the fix for the tag search issue. Let me start by examining the current code more closely and then make the necessary changes.

<claude implements the fix>

/user:commit
# Creates commit: "Fixed mobile controls."

> exit

❯ claude '/user:todo'
```

## 🛠️ The Commands

The full prompts are in this repo:
- [`commands/todo.md`](commands/todo.md) implements `/user:todo`
- [`commands/commit.md`](commands/commit.md) implements `/user:commit`

Feel free to adapt these to your own workflow!