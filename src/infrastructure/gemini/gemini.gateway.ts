import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IAIGateway, AIGenerateOptions } from "../../core/ports/ai-gateway.port";
import { Message } from "../../core/domain/message.entity";

export class GeminiGateway implements IAIGateway {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string = "gemini-2.0-flash-exp"; 

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API Key is missing");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private getModel(options?: AIGenerateOptions): GenerativeModel {
    const modelName = options?.model || this.defaultModel;
    return this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: options?.maxTokens,
        temperature: options?.temperature,
        topP: options?.topP,
      },
      systemInstruction: options?.systemPrompt
    });
  }

  private mapMessagesToGeminiHistory(messages: Message[]) {
    // Gemini expects history in specific format. 
    // The last message is usually the user prompt for generateContent, 
    // but chatSession.sendMessage takes the user prompt and history is managed by startChat.
    
    // For simplicity, we'll map previous messages to history
    // Note: Gemini roles are 'user' and 'model'.
    
    return messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }

  async generateStream(messages: Message[], options?: AIGenerateOptions): Promise<ReadableStream<string>> {
    const model = this.getModel(options);
    const history = this.mapMessagesToGeminiHistory(messages);
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessageStream(lastMessage.content);

    // Create a ReadableStream from the Gemini stream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(chunkText);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  async generate(messages: Message[], options?: AIGenerateOptions): Promise<string> {
    const model = this.getModel(options);
    const history = this.mapMessagesToGeminiHistory(messages);
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }
}

export function createGeminiGateway(): GeminiGateway {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  return new GeminiGateway(apiKey);
}
