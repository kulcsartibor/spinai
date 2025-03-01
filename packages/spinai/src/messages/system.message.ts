import { Action, formatActionsForPrompt } from "../actions";
import { Message } from "../messages";

/**
 * Creates a system message with instructions and available actions
 * @param instructions The system instructions
 * @param actions The available actions
 * @returns A formatted system message
 */
export async function createSystemMessage(
  instructions: string,
  actions: Action[]
): Promise<Message> {
  const formattedActions = await formatActionsForPrompt(actions);

  return {
    role: "system",
    content: `${instructions}
    
    ${formattedActions}
    
When you call an action, if it has any required parameters, use the past calls, or the user's query to fill them in. You must pass parameters in if they're required.`,
  };
}
