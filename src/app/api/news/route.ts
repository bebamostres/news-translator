import Anthropic from '@anthropic-ai/sdk';
import Parser from 'rss-parser';

const client = new Anthropic();
const parser = new Parser();

const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
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
        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `以下の英語ニュースのタイトルと概要を自然な日本語に翻訳してください。
JSONのみ返してください。余計な文章は不要です。

タイトル: ${article.title}
概要: ${article.contentSnippet || article.summary || ''}

返答形式:
{"title": "日本語タイトル", "summary": "日本語概要"}`,
            },
          ],
        });

        const content = message.content[0];
        if (content.type !== 'text') throw new Error('Unexpected response');
        
        const result = JSON.parse(content.text);
        
        return {
          title: result.title,
          summary: result.summary,
          originalTitle: article.title,
          url: article.link,
          publishedAt: article.pubDate,
        };
      })
    );

    return Response.json({ articles: translated });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}