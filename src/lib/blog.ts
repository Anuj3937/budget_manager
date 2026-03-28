import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  country: string;
  tags: string[];
  readTime: string;
  content: string;
}

/**
 * Get all blog posts from the content directory, sorted by date (newest first).
 */
export function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = entry.name.replace(/\.mdx?$/, '');

        posts.push({
          slug,
          title: data.title || slug,
          description: data.description || '',
          date: data.date || '',
          author: data.author || 'Horizon Team',
          country: data.country || 'global',
          tags: data.tags || [],
          readTime: data.readTime || '5 min read',
          content,
        });
      }
    }
  }

  walkDir(CONTENT_DIR);

  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug.
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const allPosts = getAllBlogPosts();
  return allPosts.find((post) => post.slug === slug);
}
