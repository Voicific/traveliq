
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../blog/posts.tsx';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center px-4">
        <div>
            <h1 className="text-4xl font-bold font-heading text-white">Post Not Found</h1>
            <p className="text-gray-300 mt-4">Sorry, we couldn't find the blog post you're looking for.</p>
            <Link to="/blog" className="mt-8 inline-block bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
                &larr; Back to Blog
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-cover bg-center" style={{ backgroundImage: `url(${post.imageUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto -mt-24 sm:-mt-32 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-2xl">
          {/* Header */}
          <header className="text-center border-b border-cyan-400/10 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white">
              {post.title}
            </h1>
            <div className="mt-6 text-gray-300 text-sm">
              <span>By {post.author}</span>
              <span className="mx-2">&bull;</span>
              <span>{post.date}</span>
            </div>
          </header>

          {/* Content */}
          <article className="prose prose-invert prose-lg max-w-none mt-8 text-gray-300 leading-relaxed selection:bg-cyan-400/20">
            {post.content}
          </article>
          
          {/* Footer Navigation */}
          <div className="mt-12 border-t border-cyan-400/10 pt-8">
             <Link to="/blog" className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-brand-magenta transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;