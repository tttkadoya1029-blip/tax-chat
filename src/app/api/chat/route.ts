import { NextRequest, NextResponse } from "next/server";
import { searchFAQ } from "@/lib/faqSearch";
import { logQuestion } from "@/lib/questionLog";
import type { ChatApiRequest, ChatApiResponse, StructuredResponse } from "@/lib/types";

const DISCLAIMER =
  "本回答は一般的な情報提供を目的としており、個別の税務判断・法的助言ではありません。実際の申告においては、最終判断を税理士にご確認ください。";

const NO_MATCH_RESPONSE: StructuredResponse = {
  answer:
    "ご質問の内容はFAQに見つかりませんでした。\n\nいったん「申告候補」としてメモしておき、税理士に確認することをお勧めします。判断が難しい場合でも、申告候補として記録しておくことで、税理士との相談をスムーズに進められます。",
  premise:
    "個別の状況によって取り扱いが異なります。似た質問をキーワードを変えて再度試してみてください。",
  documents: [
    "関連する領収書・証明書類（手元にある場合）",
    "取引の内容が分かるメモや契約書",
  ],
  needsTaxAccountant:
    "このご質問は個別の事情を確認した上での判断が必要です。税理士への確認を強くお勧めします。",
  disclaimer: DISCLAIMER,
  isFromFAQ: false,
};

export async function POST(req: NextRequest) {
  try {
    const body: ChatApiRequest = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "メッセージを入力してください" },
        { status: 400 }
      );
    }

    const trimmed = message.trim();

    // FAQを検索
    const faqResult = searchFAQ(trimmed);
    if (faqResult) {
      const res: ChatApiResponse = { structured: faqResult };
      return NextResponse.json(res);
    }

    // FAQに一致しない → 質問をログに記録して税理士案内
    logQuestion(trimmed, "no_api_key");

    const res: ChatApiResponse = { structured: NO_MATCH_RESPONSE };
    return NextResponse.json(res);
  } catch (err) {
    console.error("[chat/route] error:", err);
    return NextResponse.json(
      {
        structured: {
          answer: "システムエラーが発生しました。しばらく経ってから再度お試しください。",
          premise: "",
          documents: [],
          needsTaxAccountant: "税理士への直接ご相談をお勧めします。",
          disclaimer: DISCLAIMER,
          isFromFAQ: false,
        } satisfies StructuredResponse,
      },
      { status: 200 }
    );
  }
}
