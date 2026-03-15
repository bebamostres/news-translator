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

  const containerStyle = {
    padding: '20px',
    fontFamily: 'sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'inherit',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1a1a1a',
  };

  const summaryStyle = {
    fontSize: '14px',
    color: '#444',
    lineHeight: '1.7',
    marginBottom: '12px',
  };

  const metaStyle = {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#999',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        海外テックニュース
      </h1>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
        AIが海外の最新テックニュースを日本語に翻訳してお届け
      </p>
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          AIが翻訳中です...
        </div>
      )}
      {!loading && articles.map((article, index) => (
        <div key={index} style={cardStyle}>
          <a href={article.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <h2 style={titleStyle}>{article.title}</h2>
            <p style={summaryStyle}>{article.summary}</p>
            <div style={metaStyle}>
              <span>{new URL(article.url).hostname}</span>
              {article.publishedAt && (
                <span>{formatDate(article.publishedAt)}</span>
              )}
            </div>
          </a>
        </div>
      ))}
    </main>
  );
}