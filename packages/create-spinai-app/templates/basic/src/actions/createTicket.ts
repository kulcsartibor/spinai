import { ActionContext } from "spinai";

export async function run(context: ActionContext) {
  const { customerId } = context.store.getCustomerInfo;

  return {
    ticketId: "T-124",
    status: "created",
    assignedTo: "support-team-1",
    estimatedResponse: "2 hours",
    customerId,
  };
}

export const config = {
  id: "createTicket",
  retries: 3,
  dependsOn: ["getCustomerInfo"],
  metadata: { description: "Creates a new support ticket" },
};
