<div align="center">
<h1>SpinAI 🤖</h1>

A lightweight framework for building AI agents with TypeScript

<h3>

[Documentation](https://docs.spinai.dev) | [Discord](https://discord.gg/BFy7hMpT)

</h3>

[![GitHub Repo stars](https://img.shields.io/github/stars/Fallomai/spinai)](https://github.com/Fallomai/spinai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/spinai.svg)](https://www.npmjs.com/package/spinai)

</div>

## Quick Start

```bash
npm create spinai-app@latest
```

## Basic Example

```typescript
import { createAgent, createOpenAILLM, createAction } from "spinai";

// Define your actions
const getWeather = createAction({
  id: "getWeather",
  description: "Get the current weather for a location",
  async run(context) {
    // Implement weather API call
    context.state.weather = { temp: 72, condition: "sunny" };
    return context;
  }
});

// Create your agent
const weatherAgent = createAgent({
  instructions: "Help users with weather information",
  actions: [getWeather],
  llm: createOpenAILLM({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

// Use your agent
const { response } = await weatherAgent({
  input: "What's the weather like?",
  state: {},
});

console.log(response);
```

## Features

- 🎯 **Task-focused**: Agents execute specific actions to achieve goals
- 🔄 **DAG-based**: Handles complex action dependencies automatically
- 🔌 **Pluggable**: Works with any LLM that supports chat completions
- 🛠️ **Type-safe**: Built with TypeScript for robust development
- 🪶 **Lightweight**: Zero dependencies beyond your chosen LLM

## Documentation

Visit [docs.spinai.dev](https://docs.spinai.dev) for:
- Detailed guides
- API reference
- Advanced examples
- Best practices

## Community

- Join our [Discord](https://discord.gg/BFy7hMpT) for help and discussions
- Star us on [GitHub](https://github.com/Fallomai/spinai)
- Follow us on [Twitter](https://twitter.com/spinai_dev)

## License

MIT © [FallomAI](https://github.com/Fallomai)
