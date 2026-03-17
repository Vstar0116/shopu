import { createServerSupabaseClient } from '@/lib/supabase/serverClient';
import { checkAdminAccess } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import BlogClient from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const { hasAccess } = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/access-denied');
  }

  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage blog content and articles
        </p>
      </div>

      <BlogClient posts={posts || []} />
    </div>
  );
}
