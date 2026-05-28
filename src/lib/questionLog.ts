export interface UnansweredQuestion {
  id: string;
  timestamp: string;
  question: string;
  source: "claude_api" | "no_api_key" | "error";
}

// Vercelのサーバーレス環境ではリクエスト間でメモリは共有されません。
// 本番運用では Vercel KV / Supabase / PlanetScale 等の外部ストレージを使用してください。
const questionLog: UnansweredQuestion[] = [];

export function logQuestion(
  question: string,
  source: UnansweredQuestion["source"]
): UnansweredQuestion {
  const entry: UnansweredQuestion = {
    id: Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    question,
    source,
  };
  questionLog.push(entry);
  // Vercel Logs に記録される
  console.log("[UnansweredQuestion]", JSON.stringify(entry));
  return entry;
}

export function getQuestions(): UnansweredQuestion[] {
  return [...questionLog];
}
