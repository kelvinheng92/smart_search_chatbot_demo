export interface Message {
  role: "user" | "assistant";
  content: string;
  buttons?: string[];
  intent?: string;
  confidence?: number;
  outOfScope?: boolean;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  text: string;
  intent?: string;
  confidence?: number;
  buttons?: string[];
  outOfScope?: boolean;
  latency?: number;
}
