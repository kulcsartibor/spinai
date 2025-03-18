# Basic MCP Agent Template

This template provides a basic setup for creating an MCP (Machine Control Protocol) agent using SpinAI.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An OpenAI API key

## Setup

1. Run `npx create-spinai` and choose this template `basic-mcp-agent`
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

4. Configure your MCP actions in `mcp-config.ts`
5. Update the agent instructions and input in `src/index.ts`

## Configuration

### MCP Config

The `mcp-config.ts` file defines your MCP actions. Modify the configuration object to define your custom actions:

```typescript
export default {
  my_mcp_name: {
    command: "npx",
    args: ["-y", "my", "example", "args"],
  },
};
```

Usually you will find the MCP actions in the documentation of the software you are controlling.

Alternatively, if you are using a smithery MCP, you can use their installation tool to get the spinai command - i.e

```npx spinai-mcp install @smithery-ai/github --provider smithery --config "{\"githubPersonalAccessToken\":\"abc\"}"```

and this will automatically configure the `mcp-config.ts` file for you.

### Agent Setup

The main agent setup is in `src/index.ts`. You can customize:
- Agent instructions
- Model selection
- Input prompt
- Additional actions

## Running the Agent

To run the agent:

```bash
npm start
# or
yarn start
```

## Security Notes

- Never commit your `.env` file
- Keep your OpenAI API key secure
- Consider using environment variables for sensitive configuration

## License

MIT