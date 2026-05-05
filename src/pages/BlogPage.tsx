import React, { useState, useEffect } from 'react';
import { blogPosts, BlogPost } from '../blog/posts.tsx';
import BlogCard from '../components/BlogCard.tsx';
import { getBlogPostsFromSheet } from '../services/sheetsService.ts';
import type { ManagedBlogPost } from '../services/sheetsService.ts';

function managedToDisplay(post: ManagedBlogPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    date: post.date,
    imageUrl: post.imageUrl,
    summary: post.summary,
    author: post.author,
    content: null,
    contentText: post.content,
    isManaged: true,
  };
}

function mergePosts(managed: BlogPost[], hardcoded: BlogPost[]): BlogPost[] {
  const map = new Map<string, BlogPost>();
  // Hardcoded first as baseline, managed overrides by ID
  hardcoded.forEach(p => map.set(p.id, p));
  managed.forEach(p => map.set(p.id, p));
  return Array.from(map.values()).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBlogPostsFromSheet()
      .then(managed => {
        if (managed && managed.length > 0) {
          const managedDisplayPosts = managed.map(managedToDisplay);
          setPosts(mergePosts(managedDisplayPosts, blogPosts));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white">TravelIQ Blog</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Insights, news, and updates from the intersection of travel and artificial intelligence.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-[#0a1628]/50 border border-cyan-400/10 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
