import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { ObservationData, ActionResponse } from "../shared/quantum_types";

interface LLMClient {
  getObservationDescription(observation: ObservationData): string;
  sendObservationAndGetAction(observation: ObservationData, apiKey: string, model: string): Promise<ActionResponse>;
}

class OpenAILLMClient implements LLMClient {
  getObservationDescription(observation: ObservationData): string {
    let description = `World Time: ${observation.worldTime}.\n`;
    description += `Agent Status: Energy=${observation.agentStatus.energy.toFixed(1)}, Health=${observation.agentStatus.health.toFixed(1)}, Position=(${observation.agentStatus.position.x.toFixed(1)}, ${observation.agentStatus.position.y.toFixed(1)}).\n`;
    if (observation.nearbyObjects && observation.nearbyObjects.length > 0) {
      description += "Nearby Objects:\n";
      observation.nearbyObjects.forEach(obj => {
        description += `- ${obj.description} (ID: ${obj.id}, Type: ${obj.type}, Distance: ${obj.distance.toFixed(2)})\n`;
      });
    }
    if (observation.quantumReadings && observation.quantumReadings.length > 0) {
      description += "Quantum Readings:\n";
      observation.quantumReadings.forEach(qr => {
        description += `- Object ${qr.objectId}: ${qr.reading}\n`;
      });
    }
    return description;
  }

  async sendObservationAndGetAction(observation: ObservationData, apiKey: string, model: string = "gpt-4o-mini"): Promise<ActionResponse> {
    const openai = new OpenAI({ apiKey, baseURL: "https://api.openai.com/v1" });
    const description = this.getObservationDescription(observation);

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are an AI agent in a quantum simulation. Your goal is to interact with the world and perform actions. Respond with a natural language action and an optional thought process." },
        { role: "user", content: `Current Observation:\n${description}\n\nWhat is your next action?` }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "perform_action",
            description: "Perform an action in the simulation world.",
            parameters: {
              type: "object",
              properties: {
                action: { type: "string", description: "The natural language description of the action to perform." },
                thought: { type: "string", description: "Your internal thought process or reasoning for the action." }
              },
              required: ["action"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "perform_action" } },
      temperature: 0.7,
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];
    if (toolCall && toolCall.function.name === "perform_action") {
      const args = JSON.parse(toolCall.function.arguments);
      return { action: args.action, thought: args.thought };
    } else {
      // Fallback if LLM doesn't use the tool correctly
      return { action: response.choices[0].message.content || "do nothing", thought: "LLM did not use tool, defaulting to no action." };
    }
  }
}

class AnthropicLLMClient implements LLMClient {
  getObservationDescription(observation: ObservationData): string {
    let description = `World Time: ${observation.worldTime}.\n`;
    description += `Agent Status: Energy=${observation.agentStatus.energy.toFixed(1)}, Health=${observation.agentStatus.health.toFixed(1)}, Position=(${observation.agentStatus.position.x.toFixed(1)}, ${observation.agentStatus.position.y.toFixed(1)}).\n`;
    if (observation.nearbyObjects && observation.nearbyObjects.length > 0) {
      description += "Nearby Objects:\n";
      observation.nearbyObjects.forEach(obj => {
        description += `- ${obj.description} (ID: ${obj.id}, Type: ${obj.type}, Distance: ${obj.distance.toFixed(2)})\n`;
      });
    }
    if (observation.quantumReadings && observation.quantumReadings.length > 0) {
      description += "Quantum Readings:\n";
      observation.quantumReadings.forEach(qr => {
        description += `- Object ${qr.objectId}: ${qr.reading}\n`;
      });
    }
    return description;
  }

  async sendObservationAndGetAction(observation: ObservationData, apiKey: string, model: string = "claude-3-opus-20240229"): Promise<ActionResponse> {
    const anthropic = new Anthropic({ apiKey });
    const description = this.getObservationDescription(observation);

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1024,
      messages: [
        { role: "user", content: `You are an AI agent in a quantum simulation. Your goal is to interact with the world and perform actions. Respond with a natural language action and an optional thought process.\n\nCurrent Observation:\n${description}\n\nWhat is your next action? Please respond in JSON format with 'action' and 'thought' fields.` }
      ],
      // Anthropic does not have native tool calling like OpenAI, so we'll use JSON mode
      // This will require the LLM to format its response as JSON directly in the content
      // We will parse this content to extract action and thought.
    });

    try {
      const content = response.content[0].text;
      const jsonResponse = JSON.parse(content);
      return { action: jsonResponse.action, thought: jsonResponse.thought };
    } catch (e) {
      console.error("Failed to parse Anthropic response as JSON:", e);
      return { action: response.content[0].text || "do nothing", thought: "Failed to parse JSON response from Anthropic." };
    }
  }
}

export function getLLMClient(provider: string): LLMClient {
  if (provider === "openai") {
    return new OpenAILLMClient();
  } else if (provider === "anthropic") {
    return new AnthropicLLMClient();
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
