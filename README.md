# 控除AIチャット — 確定申告サポートプロトタイプ

納税者が控除・確定申告に関するよくある質問をチャット形式で問い合わせ、FAQベースで一次回答を受けられるシステムです。

> ⚠️ 本システムは一次情報提供のみを目的としています。税務上の最終判断は必ず税理士が行います。

---

## ディレクトリ構成

```
tax-chat/
├── data/
│   └── faq.json                     # FAQ データ（12件の控除ケース）
├── src/
│   ├── middleware.ts                 # パスワード保護（Vercel Edge Runtime対応）
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── login/
│   │   │   └── page.tsx             # ログイン画面
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts         # 認証エンドポイント
│   │       ├── chat/
│   │       │   └── route.ts         # チャットAPI（FAQ検索 + Claude API）
│   │       └── questions/
│   │           └── route.ts         # 未回答質問ログ（管理者用）
│   ├── components/
│   │   ├── ChatInterface.tsx         # チャットUI本体
│   │   ├── ChatMessage.tsx           # メッセージ表示コンポーネント
│   │   └── DisclaimerBanner.tsx
│   └── lib/
│       ├── types.ts                  # 型定義
│       ├── faqSearch.ts              # FAQ検索ロジック
│       └── questionLog.ts            # 未回答質問ロギング
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ローカル起動

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集します：

```env
# Anthropic API Key（https://console.anthropic.com/ で取得）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# アクセス用パスワード（省略するとパスワードなし）
CHAT_PASSWORD=your-password
```

### 3. 開発サーバー起動

```bash
npm run dev
```

→ http://localhost:3000 にアクセス

---

## Vercel へのデプロイ

### 方法1: Vercel CLI（推奨）

```bash
# Vercel CLI のインストール（未インストールの場合）
npm i -g vercel

# プロジェクトをデプロイ
vercel

# 環境変数を設定
vercel env add ANTHROPIC_API_KEY
vercel env add CHAT_PASSWORD

# 本番デプロイ
vercel --prod
```

### 方法2: GitHub連携（共有URLで継続的に使いやすい）

1. [GitHub にリポジトリを作成](https://github.com/new)してコードをプッシュ

```bash
git init
git add .
git commit -m "feat: initial tax chat MVP"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

2. [vercel.com](https://vercel.com) → **Add New Project** → GitHubリポジトリを選択

3. **Environment Variables** に以下を追加：

| 変数名 | 値 | 必須 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API キー | Claude API使用時 |
| `CHAT_PASSWORD` | アクセスパスワード | パスワード保護する場合 |

4. **Deploy** をクリック → `https://xxx.vercel.app` でアクセス可能に

> **共有リンクの配布**  
> デプロイ完了後のURL（`https://xxx.vercel.app`）をテスト利用者に共有してください。  
> `CHAT_PASSWORD` を設定した場合は、パスワードも合わせて連絡してください。

---

## 回答の仕組み

### ステップ1: FAQ検索（優先）

`data/faq.json` の12件のFAQと照合。キーワードマッチングとバイグラム類似度でスコアリングし、閾値以上であればFAQ回答を返します。

**FAQカバー範囲：**
- 医療費控除（対象範囲・条件）
- 社会保険料控除
- 生命保険料控除
- 地震保険料控除
- 住宅ローン控除
- 扶養控除
- 配偶者控除・配偶者特別控除
- ふるさと納税（寄附金控除）
- セルフメディケーション税制
- 給与所得者の特定支出控除
- 雑損控除

### ステップ2: Claude API（FAQに一致しない場合）

FAQで回答できない場合は Claude API（`claude-sonnet-4-6`）を呼び出します。システムプロンプトで以下を強制：
- 税務上の断定をしない
- 免責文を必ず含める
- 最終判断は税理士への確認を促す

FAQに一致しない質問は **未回答質問ログ** にも記録されます（Vercel Logsで確認可能）。

---

## 未回答質問の確認

FAQ未一致の質問は管理者エンドポイントで確認できます：

```bash
curl -H "Authorization: Bearer <CHAT_PASSWORD>" \
  https://xxx.vercel.app/api/questions
```

> **注意：** Vercel サーバーレス環境では、関数インスタンスの再起動でメモリ上のログはリセットされます。  
> 永続化が必要な場合は [Vercel KV](https://vercel.com/docs/storage/vercel-kv)、[Supabase](https://supabase.com/)、[PlanetScale](https://planetscale.com/) 等の外部ストレージを導入してください。

---

## 回答の構造

すべての回答は以下の構造を持ちます：

| フィールド | 内容 |
|---|---|
| **回答** | 質問への一般的な回答（断定なし） |
| **判断の前提・要件** | 控除適用の主な条件 |
| **主な必要書類** | 申告に必要な書類一覧 |
| **税理士確認が必要なケース** | 個別判断が必要な状況 |
| **免責文** | 必ず表示。最終判断は税理士が行う旨 |

---

## FAQのカスタマイズ

`data/faq.json` に追記することでFAQを拡充できます：

```json
{
  "id": 13,
  "keywords": ["キーワード1", "キーワード2"],
  "question": "代表的な質問文",
  "answer": "回答（断定しない表現で）",
  "premise": "前提条件・要件",
  "documents": ["必要書類1", "必要書類2"],
  "needsTaxAccountant": "税理士確認が必要なケース",
  "disclaimer": "免責文"
}
```

---

## パスワード保護の仕組み

`CHAT_PASSWORD` が設定されている場合：
- すべてのページへのアクセス時に `/login` へリダイレクト
- 正しいパスワードを入力すると7日間有効なHttpOnly Cookieを発行
- パスワードはSHA-256でハッシュ化されてCookieに保存（平文保存なし）
- Vercel Edge Middleware で実装（高速・低レイテンシ）

---

## 重要な制約事項

- 本システムは税務判断を断定しません
- 「控除対象です」と確定する回答は行いません
- すべての回答に「最終判断は税理士が行います」を表示します
- FAQにない質問は「申告候補として記録し、税理士に確認」と案内します
- 法的・税務的な最終助言ではない旨を明記します
