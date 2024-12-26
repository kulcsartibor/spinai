import { ActionContext } from "@repo/spinup";

export async function run(context: ActionContext) {
  const { input } = context.request;
  const user = context.store.searchUser;

  // TODO: Replace with actual Zendesk API call
  return {
    id: "T-12345",
    subject: input,
    description: input,
    requester_id: user.id,
    status: "new",
    priority: "normal",
    tags: ["api", "new_ticket"],
  };
}

export const config = {
  id: "createTicket",
  retries: 3,
  dependsOn: ["searchUser"],
  metadata: { description: "Creates a new Zendesk ticket" },
};
