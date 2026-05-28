import type { FAQItem, StructuredResponse } from "./types";
import faqData from "../../data/faq.json";

const FAQ: FAQItem[] = faqData as FAQItem[];

const MATCH_THRESHOLD = 2;

function scoreQuery(query: string, faq: FAQItem): number {
  const q = query.toLowerCase();
  let score = 0;

  for (const keyword of faq.keywords) {
    if (q.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  // bigram matching against the representative question
  for (let i = 0; i < q.length - 1; i++) {
    const bigram = q.slice(i, i + 2);
    if (faq.question.includes(bigram)) {
      score += 0.3;
    }
  }

  return score;
}

export function searchFAQ(query: string): StructuredResponse | null {
  const scored = FAQ.map((faq) => ({ faq, score: scoreQuery(query, faq) }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < MATCH_THRESHOLD) return null;

  return {
    answer: best.faq.answer,
    premise: best.faq.premise,
    documents: best.faq.documents,
    needsTaxAccountant: best.faq.needsTaxAccountant,
    disclaimer: best.faq.disclaimer,
    isFromFAQ: true,
    matchedQuestion: best.faq.question,
    score: best.score,
  };
}
