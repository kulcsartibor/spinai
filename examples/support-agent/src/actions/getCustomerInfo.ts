import { createAction } from "spinai";

export const getCustomerInfo = createAction({
  id: "getCustomerInfo",
  description: "Retrieves customer profile and status",
  async run(context) {
    context.state.customerInfo = {
      customerId: "abc123",
      name: "Jane Smith",
      tier: "premium",
      lastContact: "2024-02-20",
      openTickets: 2,
    };
    await new Promise((resolve) => setTimeout(resolve, 250));
    return context;
  },
});
