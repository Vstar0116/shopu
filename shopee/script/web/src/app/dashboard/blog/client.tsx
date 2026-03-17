'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts: initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const router = useRouter();

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const refreshRes = await fetch('/api/admin/blog');
      const data = await refreshRes.json();
      setPosts(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: 'cover_image',
      label: 'Cover',
      render: (post) =>
        post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="h-12 w-20 rounded-lg object-cover" />
        ) : (
          <div className="h-12 w-20 rounded-lg bg-slate-200" />
        ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (post) => (
        <div>
          <p className="font-semibold text-slate-900">{post.title}</p>
          {post.excerpt && (
            <p className="text-xs text-slate-500 line-clamp-1">{post.excerpt}</p>
          )}
        </div>
      ),
    },
    {
      key: 'author_id',
      label: 'Author',
      render: (post) => (
        <span className="text-sm text-slate-600">
          {post.profiles?.full_name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (post) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            post.is_published
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {post.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'published_at',
      label: 'Published',
      sortable: true,
      render: (post) => (
        <span className="text-sm text-slate-600">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString('en-IN')
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/dashboard/blog/new')}
          className={`flex items-center gap-2 rounded-xl ${colors.primary} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${colors.primaryHover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </button>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        keyExtractor={(post) => post.id.toString()}
        searchPlaceholder="Search posts..."
        emptyMessage="No blog posts yet"
        actions={(post) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/blog/${post.id}`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(post)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
