import { ActionContext } from "@repo/spinup";

export async function run(context: ActionContext) {
  const ticket = context.store.createTicket;
  // TODO: Replace with actual Zendesk API call
  return {
    id: "C-789",
    ticket_id: ticket.id,
    body: "Thank you for contacting support. We'll look into this right away.",
    public: true,
    created_at: new Date().toISOString(),
  };
}

export const config = {
  id: "addComment",
  retries: 2,
  dependsOn: ["createTicket"],
  metadata: { description: "Adds a comment to a Zendesk ticket" },
};
