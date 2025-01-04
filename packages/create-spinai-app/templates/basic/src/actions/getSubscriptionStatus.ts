import { createAction } from "spinai";

export const getSubscriptionStatus = createAction({
  id: "getSubscriptionStatus",
  description: "Checks customer's subscription details",
  dependsOn: ["getCustomerInfo"],
  async run(context) {
    context.state.subscription = {
      plan: "enterprise",
      status: "active",
      billingCycle: "monthly",
      nextBilling: "2024-03-20",
      features: ["priority-support", "api-access", "custom-integrations"],
    };
    return context;
  },
});
