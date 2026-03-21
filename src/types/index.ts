export interface Button {
  label: string;
  url?: string; // if present → open URL in new tab; if absent → send as chat suggestion
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  buttons?: Button[];
  additionalIntents?: string[]; // extra matched intent names shown as suggestions
  intent?: string;
  product?: string;
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
  product?: string;
  buttons?: Button[];
  additionalIntents?: string[];
  outOfScope?: boolean;
  latency?: number;
}
