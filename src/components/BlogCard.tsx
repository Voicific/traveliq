import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../blog/posts.tsx';

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  // h-full makes the card stretch to the height of the grid row
  <div className="bg-[#0a1628]/50 backdrop-blur-lg border border-cyan-400/10 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-2xl hover:shadow-brand-cyan/10 flex flex-col h-full">
    <Link to={`/blog/${post.id}`}>
      <img className="h-56 w-full object-cover group-hover:opacity-90 transition-opacity" src={post.imageUrl} alt={post.title} />
    </Link>
    {/* flex-grow allows this content area to fill the remaining vertical space */}
    <div className="p-6 flex flex-col flex-grow">
      <div>
          <p className="text-sm text-gray-300 mb-2">{post.date}</p>
          <h2 className="text-2xl font-bold font-heading text-white mb-3">
            <Link to={`/blog/${post.id}`} className="hover:text-cyan-400 transition-colors">{post.title}</Link>
          </h2>
          <p className="text-gray-300 mb-6">{post.summary}</p>
      </div>
      <div className="mt-auto">
        <Link to={`/blog/${post.id}`} className="font-bold text-cyan-400 hover:text-brand-magenta transition-colors">
          Read More &rarr;
        </Link>
      </div>
    </div>
  </div>
);

export default BlogCard;