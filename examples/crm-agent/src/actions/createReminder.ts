import { createAction } from "spinai";

export const createReminder = createAction({
  id: "createReminder",
  description: "Create a reminder for action Items",
  async run(context) {
    context.state.subscription = {
      customerId: { type: "string" },
      reminderText: { type: "string" },
    };
    return context;
  },
});
