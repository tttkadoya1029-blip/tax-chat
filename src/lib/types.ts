export interface FAQItem {
  id: number;
  keywords: string[];
  question: string;
  answer: string;
  premise: string;
  documents: string[];
  needsTaxAccountant: string;
  disclaimer: string;
}

export interface StructuredResponse {
  answer: string;
  premise: string;
  documents: string[];
  needsTaxAccountant: string;
  disclaimer: string;
  isFromFAQ: boolean;
  matchedQuestion?: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: StructuredResponse;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatApiRequest {
  message: string;
}

export interface ChatApiResponse {
  structured: StructuredResponse;
}
