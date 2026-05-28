import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/questionLog";

// 管理者向け：FAQにない質問の一覧を返す
// アクセスには CHAT_PASSWORD による認証が必要
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedPassword = process.env.CHAT_PASSWORD;

  if (expectedPassword) {
    const token = authHeader?.replace("Bearer ", "");
    if (token !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const questions = getQuestions();
  return NextResponse.json({
    count: questions.length,
    questions,
    note: "Vercelのサーバーレス環境では、このデータは関数インスタンスの再起動でリセットされます。永続化には外部DBをご利用ください。",
  });
}
