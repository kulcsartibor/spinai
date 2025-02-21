import { createAction } from "spinai";
import type { SpinAiContext } from "spinai";
import { OpenAI } from "openai";

const EMAIL_PROMPTS = {
  FOLLOW_UP:
    "You are an expert sales assistant helping to craft a follow-up email. Consider the deal context and previous communications to create a compelling, personalized follow-up that moves the conversation forward.",
  REVIVAL:
    "You are an expert sales assistant helping to revive a stalled deal. Review the deal history and craft a strategic re-engagement email that addresses potential concerns and provides new value.",
  CLOSING:
    "You are an expert sales assistant helping to close a deal. Create an email that summarizes the value proposition, addresses any remaining objections, and presents a clear path to closing.",
} as const;

type PromptType = keyof typeof EMAIL_PROMPTS;

export const createEmailPlan = createAction({
  id: "createEmailPlan",
  description:
    "Analyzes deal and email history to create a strategic email plan based on the specified prompt type.",
  parameters: {
    type: "object",
    properties: {
      promptType: {
        type: "string",
        description:
          "Type of email prompt to use (FOLLOW_UP, REVIVAL, or CLOSING)",
        enum: Object.keys(EMAIL_PROMPTS),
      },
      dealInfo: {
        type: "object",
        description: "Deal information from Hubspot",
      },
      emailHistory: {
        type: "array",
        description: "Past email communications",
      },
    },
    required: ["promptType", "dealInfo", "emailHistory"],
  },

  async run(
    context: SpinAiContext,
    parameters?: Record<string, unknown>
  ): Promise<SpinAiContext> {
    const { promptType, dealInfo, emailHistory } = parameters || {};

    if (!promptType || !dealInfo || !emailHistory) {
      throw new Error("Missing required parameters");
    }

    // Validate prompt type before proceeding
    if (!Object.keys(EMAIL_PROMPTS).includes(promptType as string)) {
      context.state.error = `Invalid prompt type: ${promptType}`;
      return context;
    }

    const selectedPrompt = EMAIL_PROMPTS[promptType as PromptType];
    console.log("Selected Prompt:", selectedPrompt);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${selectedPrompt}\n\nProvide your response in the following JSON format:
            {
              "analysis": {
                "dealContext": "string describing the current deal status and context",
                "communicationHistory": "string summarizing past communications",
                "keyInsights": ["array of key insights as strings"]
              },
              "emailPlan": {
                "subject": "email subject line",
                "greeting": "email greeting",
                "body": "main email body",
                "callToAction": "specific call to action",
                "closing": "email closing"
              },
              "strategy": {
                "timing": "recommended timing for sending",
                "followUpPlan": "plan for following up",
                "riskFactors": ["array of potential risk factors"]
              }
            }`,
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                deal: dealInfo,
                emailHistory: emailHistory,
              },
              null,
              2
            ),
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error("No content received from OpenAI");
      }

      const emailPlan = JSON.parse(completion.choices[0].message.content);

      // Replace this.validateEmailPlanFormat with validateEmailPlanFormat
      if (!validateEmailPlanFormat(emailPlan)) {
        throw new Error("Response format does not match expected schema");
      }

      context.state.emailPlan = emailPlan;

      console.log("Email Plan:", JSON.stringify(emailPlan, null, 2));

      return context;
    } catch (error: any) {
      console.error("Error in createEmailPlan action:", error);
      context.state.error = `Error creating email plan: ${error.message}`;
      return context;
    }
  },
});

// Add this helper function outside the createAction definition
function validateEmailPlanFormat(emailPlan: any): boolean {
  const requiredStructure = {
    analysis: ["dealContext", "communicationHistory", "keyInsights"],
    emailPlan: ["subject", "greeting", "body", "callToAction", "closing"],
    strategy: ["timing", "followUpPlan", "riskFactors"],
  };

  try {
    for (const [section, fields] of Object.entries(requiredStructure)) {
      if (!emailPlan[section] || typeof emailPlan[section] !== "object")
        return false;
      if (!fields.every((field) => field in emailPlan[section])) return false;
    }
    return (
      Array.isArray(emailPlan.analysis.keyInsights) &&
      Array.isArray(emailPlan.strategy.riskFactors)
    );
  } catch {
    return false;
  }
}
