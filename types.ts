
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
