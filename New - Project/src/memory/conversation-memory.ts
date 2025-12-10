import { cacheManager } from './cache-manager';
import { logger } from '../utils/logger';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

class ConversationMemory {
  private readonly prefix = 'conversation:';
  private readonly maxMessages = 50;

  addMessage(sessionId: string, message: ConversationMessage): void {
    const key = `${this.prefix}${sessionId}`;
    const messages = this.getMessages(sessionId);
    messages.push(message);

    // Keep only the last maxMessages
    if (messages.length > this.maxMessages) {
      messages.shift();
    }

    cacheManager.set(key, messages, 3600); // 1 hour TTL
    logger.debug('Message added to conversation memory', { sessionId, role: message.role });
  }

  getMessages(sessionId: string): ConversationMessage[] {
    const key = `${this.prefix}${sessionId}`;
    return cacheManager.get<ConversationMessage[]>(key) || [];
  }

  getContext(sessionId: string, maxMessages: number = 10): ConversationMessage[] {
    const messages = this.getMessages(sessionId);
    return messages.slice(-maxMessages);
  }

  clear(sessionId: string): void {
    const key = `${this.prefix}${sessionId}`;
    cacheManager.delete(key);
    logger.info('Conversation memory cleared', { sessionId });
  }
}

export const conversationMemory = new ConversationMemory();
