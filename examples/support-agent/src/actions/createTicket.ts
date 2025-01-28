import { createAction } from "spinai";

export const createTicket = createAction({
  id: "createTicket",
  description: "Creates a new support ticket",
  dependsOn: ["getCustomerInfo", "getSubscriptionStatus"],
  async run(context) {
    const { customerInfo, subscription } = context.state;

    context.state.ticket = {
      ticketId: "T-124",
      status: "created",
      priority: subscription.plan === "enterprise" ? "high" : "medium",
      assignedTo: "support-team-1",
      estimatedResponse: "2 hours",
      customerId: customerInfo.customerId,
      description: context.input,
    };
    await new Promise((resolve) => setTimeout(resolve, 155));

    return context;
  },
});
