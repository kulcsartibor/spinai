import { ActionContext } from "spinai";

export async function run(context: ActionContext) {
  const { preferredTime } = context.store.getCustomerInfo;
  // Simulate scheduling
  return {
    callbackId: "CB-789",
    scheduledFor: preferredTime || "next available",
    assignedAgent: "John Support",
    estimatedDuration: "30 minutes",
  };
}

export const config = {
  id: "scheduleCallback",
  retries: 3,
  dependsOn: ["getCustomerInfo", "getRecentTickets"],
  metadata: {
    description: "Schedules a support callback for an existing ticket",
  },
};
