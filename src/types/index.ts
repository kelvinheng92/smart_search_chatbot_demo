export interface Button {
  label: string;
  url?: string; // if present → open URL in new tab; if absent → send as chat suggestion
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  buttons?: Button[];
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
  buttons?: Button[];
  outOfScope?: boolean;
  latency?: number;
}
