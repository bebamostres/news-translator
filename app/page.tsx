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
    marginBottom: '