import { createAction } from "spinai";

export const updateCustomerInfo = createAction({
  id: "updateCustomerInfo",
  description: "Update the customer information in the CRM system",
  async run(context) {
    context.state.customerInfo = {
      customerId: "abc123",
      name: "Jane Smith",
      updates: { type: "object" }
    };
    return context;
  },
});
