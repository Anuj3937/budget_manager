import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api', '/budgets', '/categories', '/reports'],
    },
    sitemap: 'https://horizon-finance.vercel.app/sitemap.xml',
  };
}
