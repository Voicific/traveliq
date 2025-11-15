

import React from 'react';
import { blogPosts } from '../blog/posts.tsx';
import BlogCard from '../components/BlogCard.tsx';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white">TravelIQ Blog</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Insights, news, and updates from the intersection of travel and artificial intelligence.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;