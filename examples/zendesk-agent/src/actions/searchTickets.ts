import { ActionContext } from "@repo/spinup";

export async function run(context: ActionContext) {
  const user = context.store.searchUser;
  // TODO: Replace with actual Zendesk API call
  return {
    tickets: [
      {
        id: "T-12344",
        subject: "Previous API Issue",
        status: "open",
        created_at: "2024-02-20T10:00:00Z",
        requester_id: user.id,
      },
    ],
    count: 1,
  };
}

export const config = {
  id: "searchTickets",
  retries: 2,
  dependsOn: ["searchUser"],
  metadata: { description: "Searches for existing Zendesk tickets" },
};
