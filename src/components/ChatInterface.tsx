"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import type { ChatMessage, ChatApiResponse } from "@/lib/types";
import ChatMessageComponent from "./ChatMessage";

const SAMPLE_QUESTIONS = [
  "医療費控除はどのような場合に使えますか？",
  "ふるさと納税の仕組みを教えてください",
  "住宅ローン控除はどうすれば受けられますか？",
  "扶養控除の対象になる条件は？",
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "",
  structured: {
    answer:
      "こんにちは！控除・確定申告に関するご質問にお答えします。\n\nよくある控除の種類：医療費控除・住宅ローン控除・扶養控除・生命保険料控除・ふるさと納税など\n\nご質問をテキストで入力してください。FAQに近い質問はすぐに回答できます。FAQにない場合はAIが一般情報を提供します（APIキー設定が必要）。",
    premise: "",
    documents: [],
    needsTaxAccountant: "",
    disclaimer:
      "本サービスはAIによる一次情報提供です。税務上の最終判断は必ず税理士にご確認ください。",
    isFromFAQ: true,
    matchedQuestion: undefined,
  },
  timestamp: new Date(),
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    const loadingMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data: ChatApiResponse = await res.json();

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.structured.answer,
        structured: data.structured,
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove loading
        assistantMessage,
      ]);
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "エラーが発生しました。再度お試しください。",
        structured: {
          answer: "エラーが発生しました。再度お試しください。",
          premise: "",
          documents: [],
          needsTaxAccountant: "",
          disclaimer:
            "本サービスはAIによる一次情報提供です。最終判断は税理士にご確認ください。",
          isFromFAQ: false,
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Sample questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">よくある質問：</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="控除・確定申告についてご質問ください（例：医療費控除はいつ申告できますか？）"
            className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors flex-shrink-0"
          >
            送信
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Enter で送信 / Shift+Enter で改行
        </p>
      </div>
    </div>
  );
}
