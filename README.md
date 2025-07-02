# AI Message Writer Assistant

A React Router application for AI-powered message writing using Anthropic's Claude API.

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

## Security Notes

- The `.env` file is excluded from version control via `.gitignore`
- API keys are loaded from environment variables at runtime
- Never hardcode API keys in your source code

---

Built with ❤️ using React Router and Anthropic Claude API.
