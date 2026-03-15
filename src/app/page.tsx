'use client';
import { useEffect, useState } from 'react';

type Article = {
  title: string;
  summary: string;
  originalTitle: string;
  url: string;
  publishedAt: string;
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <h1>海外テックニュース</h1>
      {loading && <p>読み込み中...</p>}
      {!loading && articles.map((article, index) => (
        <div key={index} style={{border: '1px solid #ddd', padding: '16px', marginBottom: '16px', borderRadius: '8px'}}>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">元記事を読む</a>
        </div>
      ))}
    </main>
  );
}