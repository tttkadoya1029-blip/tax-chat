"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.isLoading) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[75%] bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="flex gap-1 items-center h-5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  const s = message.structured;

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] w-full">
        {/* Source badge */}
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              s?.isFromFAQ
                ? "bg-green-100 text-green-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {s?.isFromFAQ ? "FAQ回答" : "AI生成回答"}
          </span>
          {s?.matchedQuestion && (
            <span className="text-xs text-gray-500 truncate">
              参照: {s.matchedQuestion}
            </span>
          )}
        </div>

        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
          {/* Answer */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {s?.answer ?? message.content}
            </p>
          </div>

          {s && (
            <>
              {/* Premise */}
              {s.premise && (
                <Section title="📋 判断の前提・要件" color="blue">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {s.premise}
                  </p>
                </Section>
              )}

              {/* Documents */}
              {s.documents.length > 0 && (
                <Section title="📄 主な必要書類" color="green">
                  <ul className="space-y-1">
                    {s.documents.map((doc, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-1">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Tax accountant */}
              {s.needsTaxAccountant && (
                <Section title="👨‍💼 税理士確認が必要なケース" color="orange">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {s.needsTaxAccountant}
                  </p>
                </Section>
              )}

              {/* Disclaimer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  ⚠️ {s.disclaimer}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  最終判断は税理士が行います。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: "blue" | "green" | "orange";
  children: React.ReactNode;
}) {
  const bg = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    orange: "bg-orange-50 border-orange-100",
  }[color];

  return (
    <div className={`px-4 py-3 border-t ${bg}`}>
      <p className="text-xs font-semibold text-gray-600 mb-1">{title}</p>
      {children}
    </div>
  );
}
