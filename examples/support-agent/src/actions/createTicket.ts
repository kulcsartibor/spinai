import { ActionContext } from "spinai";

export async function run(context: ActionContext) {
  const { customerId } = context.store.getCustomerInfo;
  const { description } = context.store.generateTicketDescription;

  return {
    ticketId: "T-124",
    status: "created",
    assignedTo: "support-team-1",
    estimatedResponse: "2 hours",
    customerId,
    description,
  };
}

export const config = {
  id: "createTicket",
  retries: 3,
  dependsOn: ["getCustomerInfo", "generateTicketDescription"],
  metadata: { description: "Creates a new support ticket" },
};
