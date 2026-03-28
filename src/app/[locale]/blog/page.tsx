import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Clock, ArrowRight, Globe, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learn | Financial Education Hub',
  description: 'Expert guides on tax planning, budgeting, investments, and personal finance — tailored for your country.',
};

export default function BlogHub() {
  const posts = getAllBlogPosts();

  const countryLabels: Record<string, { label: string; icon: typeof Globe }> = {
    in: { label: '🇮🇳 India', icon: MapPin },
    us: { label: '🇺🇸 USA', icon: MapPin },
    global: { label: '🌍 Global', icon: Globe },
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-4xl">
      {/* Hero */}
      <div className="flex flex-col gap-3 mb-10">
        <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
          <BookOpen className="h-9 w-9 text-primary" />
          Learn
        </h1>
        <p className="text-lg text-muted-foreground">
          Expert financial guides on tax planning, budgeting strategies, and investment insights — written for real people, not accountants.
        </p>
      </div>

      {/* Blog Grid */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {countryLabels[post.country]?.label || '🌍 Global'}
                  </Badge>
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No articles yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
