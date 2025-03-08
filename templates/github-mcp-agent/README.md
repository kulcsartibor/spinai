# GitHub MCP Agent

A SpinAI agent that helps you manage GitHub repositories using MCP actions. This agent can create repositories, manage issues, search code, and more - all through natural language commands!

## Quick Start

### Option 1: Using the Template (Recommended)

```bash
npm create spinai
```

Select `GitHub MCP Agent` when prompted for the template.

### Option 2: Manual Setup

Follow our step-by-step guide in the [documentation](https://docs.spinai.dev/mcp/overview).

## Configuration

1. Create a `.env` file in your project root:
```bash
OPENAI_API_KEY="your_openai_api_key"
GITHUB_TOKEN="your_github_token"
```

2. Get your tokens:
   - [OpenAI API Key](https://platform.openai.com/account/api-keys)
   - [GitHub Personal Access Token](https://github.com/settings/tokens) (needs `repo` and `read:user` permissions)

## Usage

```bash
npm run dev
```

Try commands like:
- "Create a new repository called 'my-project'"
- "Search for repositories about machine learning"
- "Create an issue in my repository"

## Documentation

- [Full MCP Actions Guide](https://docs.spinai.dev/mcp/overview)
- [SpinAI Documentation](https://docs.spinai.dev)
- [Available GitHub Actions](https://docs.spinai.dev/mcp/github-actions)

## Features

- 🤖 Natural language GitHub management
- 🔄 Full GitHub API access through MCP
- 💬 Interactive chat mode
- 🚀 Easy deployment options
- 📝 Conversation history support

## Next Steps

- Add a web UI
- Deploy as an API endpoint
- Customize the agent's instructions
- Add more MCP actions

Check our [documentation](https://docs.spinai.dev) for more examples and advanced usage!
