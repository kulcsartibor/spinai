import { ActionContext } from "@repo/spinup";

export async function run(context: ActionContext) {
  const { input } = context.request;
  // TODO: Replace with actual Zendesk API call
  return {
    id: 123456,
    email: "customer@example.com",
    name: "John Customer",
    tags: ["vip", "enterprise"],
    organization: "Acme Corp",
    locale: "en-US",
    phone: "+1234567890",
  };
}

export const config = {
  id: "searchUser",
  retries: 2,
  metadata: { description: "Searches for a user in Zendesk" },
};
