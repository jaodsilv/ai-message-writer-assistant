# AI Message Writer Assistant

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
