import { ActionContext } from "@repo/spinup";

export async function run(context: ActionContext) {
  const { input } = context.request;

  return {
    description: {
      summary: input,
      category: input.toLowerCase().includes("api")
        ? "API Issue"
        : "General Support",
      priority: "medium",
      details: `Customer reported: ${input}`,
      timestamp: new Date().toISOString(),
    },
  };
}

export const config = {
  id: "generateTicketDescription",
  retries: 2,
  dependsOn: [],
  metadata: {
    description: "Generates a structured ticket description from user input",
  },
};
