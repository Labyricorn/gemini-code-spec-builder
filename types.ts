
export enum AppStage {
  IDEA,
  REQUIREMENTS,
  DESIGN,
  TASKS,
  COMPLETE
}

export type ActiveTab = 'requirements' | 'design' | 'tasks';

export interface ChatMessage {
  sender: 'user' | 'gemini';
  text: string;
}

export interface DocumentState {
  content: string;
  isApproved: boolean;
}

export type LlmServiceType = 'gemini' | 'ollama' | 'lemonade';

export interface LlmResponse {
    chatResponse: string;
    documentContent: string;
}

export interface LlmService {
    generateRequirements(appIdea: string): Promise<LlmResponse>;
    refineDocument(currentDocument: string, chatHistory: ChatMessage[]): Promise<LlmResponse>;
    generateDesign(requirements: string): Promise<LlmResponse>;
    generateTasks(requirements: string, design: string): Promise<LlmResponse>;
}