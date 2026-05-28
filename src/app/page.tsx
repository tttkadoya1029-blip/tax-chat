import DisclaimerBanner from "@/components/DisclaimerBanner";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-sm">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 flex-shrink-0">
        <h1 className="text-lg font-bold">控除AIチャット</h1>
        <p className="text-xs text-blue-200 mt-0.5">
          確定申告・税務控除に関するよくある質問にAIが一次回答します
        </p>
      </header>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
