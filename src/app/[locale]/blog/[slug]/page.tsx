import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12 px-6 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all articles
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-headline font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-muted-foreground mb-6">
          {post.description}
        </p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-border/50 pb-6">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readTime}
          </span>
        </div>
      </header>

      {/* Article Content — rendered as raw markdown */}
      <div className="prose prose-invert prose-primary max-w-none
        prose-headings:font-headline prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-li:text-muted-foreground
        prose-strong:text-foreground
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-table:border-border prose-th:border-border prose-td:border-border
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      ">
        {/* Simple markdown rendering — split by lines and render */}
        {post.content.split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
          if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
          if (line.startsWith('---')) return <hr key={i} />;
          if (line.startsWith('|')) return <p key={i} className="font-mono text-xs">{line}</p>;
          if (line.startsWith('*')) return <p key={i} className="italic text-xs">{line.replace(/\*/g, '')}</p>;
          if (line.trim() === '') return <br key={i} />;
          return <p key={i}>{line}</p>;
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 p-6 rounded-xl border border-primary/30 bg-primary/5 text-center">
        <h3 className="text-lg font-bold mb-2">Ready to take control of your finances?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Join thousands of users who manage their money smarter with Horizon.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all"
        >
          Get Started Free
        </Link>
      </div>
    </article>
  );
}
