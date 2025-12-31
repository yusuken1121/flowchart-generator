/**
 * Send Message Use Case
 * 
 * This use case handles the business logic for sending messages to the AI.
 * It interacts with the AI Gateway interface, adhering to the Dependency Inversion Principle.
 */

import type { Message } from '../domain/message.entity';
import type { IAIGateway, AIGenerateOptions } from '../ports/ai-gateway.port';

export interface SendMessageInput {
  messages: Message[];
  options?: AIGenerateOptions;
}

export interface SendMessageOutput {
  stream: ReadableStream<string>;
}

export class SendMessageUseCase {
  constructor(private readonly aiGateway: IAIGateway) {}

  /**
   * Execute the use case (Streaming)
   * 
   * @param input - The input parameters containing messages and options
   * @returns A promise resolving to the output containing the response stream
   */
  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const { messages, options } = input;

    // Here we could add additional business logic, such as:
    // - Message persistence
    // - Context management
    // - Token counting validity checks
    // - Analytics logging

    const stream = await this.aiGateway.generateStream(messages, options);

    return { stream };
  }

  /**
   * Execute the use case (Non-Streaming)
   * 
   * @param input - The input parameters containing messages and options
   * @returns A promise resolving to the complete text response
   */
  async executeNonStreaming(input: SendMessageInput): Promise<string> {
    const { messages, options } = input;

    // Similar business logic hooks as the streaming version

    return this.aiGateway.generate(messages, options);
  }
}
