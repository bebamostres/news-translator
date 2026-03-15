import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const parser = new Parser();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RSS_FEEDS = [
  // テック全般
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.wired.com/feed/rss',
  // AI特化
  'https://venturebeat.com/category/ai/feed/',
  // ガジェット
  'https://www.engadget.com/rss.xml',
];

export async function GET() {
  try {
    const allArticles: any[] = [];
    
    for (const feedUrl of RSS_FEEDS) {
      const feed = await parser.parseURL(feedUrl);
      const articles = feed.items.slice(0, 3);
      allArticles.push(...articles);
    }

    const translated = await Promise.all(
      allArticles.map(async (article) => {
        // すでにDBにある記事はスキップ
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('url', article.link)
          .single();

        if (existing) {
          return null;
        }

        const result = await model.generateContent(`以下の英語ニュースを日本語に翻訳してください。
要約は3〜5文で詳しく書いてください。
JSONのみ返してください。マークダウン不要です。

タイトル: ${article.title}
本文: ${article.contentSnippet || article.summary || ''}

返答形式:
{"title": "日本語タイトル", "summary": "日本語要約（3〜5文）"}`);

        const text = result.response.text();
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        
        const newArticle = {
          title: parsed.title,
          summary: parsed.summary,
          original_title: article.title,
          url: article.link,
          published_at: article.pubDate,
        };

        // DBに保存
        await supabase.from('articles').insert(newArticle);

        return {
          title: parsed.title,
          summary: parsed.summary,
          originalTitle: article.title,
          url: article.link,
          publishedAt: article.pubDate,
        };
      })
    );

    // DBから全記事を取得して返す
    const { data: dbArticles } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20);

    const articles = dbArticles?.map((a) => ({
      title: a.title,
      summary: a.summary,
      originalTitle: a.original_title,
      url: a.url,
      publishedAt: a.published_at,
    }));

    return Response.json({ articles });
  } catch (error: any) {
    console.error('Error details:', JSON.stringify(error, null, 2));
    return Response.json({ error: 'Failed to fetch news', details: error?.message }, { status: 500 });
  }
}