// spin.config.js
import { calculatorAgent } from "./dist/index.js";
import { z } from "zod";

// Define the response schema
const responseSchema = z.object({
  finalNumber: z.number(),
});

// Export the configuration
export default {
  // Server configuration
  server: {
    port: 3000,
    cors: true,
  },

  // Define agents
  agents: [
    {
      // The agent function
      agent: calculatorAgent,

      // Endpoint path (will be prefixed with /api/)
      path: "calculator",

      // Metadata
      name: "Calculator",
      description: "A calculator agent that can perform math operations",

      // Response schema for structured responses
      responseSchema: responseSchema,
    },
  ],
};
