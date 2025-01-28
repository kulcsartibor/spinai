"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var spinai_1 = require("spinai");
var dotenv = require("dotenv");
var getCustomerInfo_1 = require("./actions/getCustomerInfo");
var getSubscriptionStatus_1 = require("./actions/getSubscriptionStatus");
var createTicket_1 = require("./actions/createTicket");
dotenv.config();
// OpenAI Example:
var llm = (0, spinai_1.createOpenAILLM)({
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o-mini",
});
var supportAgent = (0, spinai_1.createAgent)({
    instructions: "You are a customer support agent.",
    actions: [getCustomerInfo_1.getCustomerInfo, getSubscriptionStatus_1.getSubscriptionStatus, createTicket_1.createTicket],
    llm: llm,
    agentId: "customer-support-test",
    spinApiKey: process.env.SPINAI_API_KEY || "",
    // debug: false,
    responseFormat: {
        type: "json",
        schema: {
            type: "object",
            properties: {
                nextBilling: { type: "string" },
                subscriptionType: { type: "string" },
                name: { type: "string" },
            },
            required: ["nextBilling", "subscriptionType", "name"],
        },
    },
});
var _a = await supportAgent({
    input: "Please create a support ticket for a dashboard issue",
    state: {},
    // sessionId: "01ced245-9cae-4ed8-ac94-ff989d92d38c",
}), response = _a.response, sessionId = _a.sessionId;
console.log("agent done running", response, sessionId);
