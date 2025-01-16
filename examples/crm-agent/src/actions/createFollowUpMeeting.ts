import { createAction } from "spinai";

export const createFollowUpMeeting = createAction({
  id: "createFollowUpMeeting",
  description: "Create follow up meeting in google calendar",
  async run(context) {
    context.state.subscription = {
      customerId: { type: "string" },
      customerName: { type: "string" },
      date: { type: "string" },
    };
    return context;
  },
});
