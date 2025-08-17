'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackPost, FeedbackTag } from '@/types/feedback-reddit';
import { tagConfig } from '@/types/feedback-reddit';

export default function CommunityPage() {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | FeedbackTag>('all');
  // Always sort by newest first
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<FeedbackTag>('feedback');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from('feedback_posts_with_user_info')
        .select('*');

      if (filter !== 'all') {
        query = query.eq('tag', filter);
      }

      // Always sort by newest first
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !content) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_posts')
        .insert({
          user_id: user.id,
          title,
          content,
          tag
        });

      if (error) throw error;

      // Reset form
      setTitle('');
      setContent('');
      setTag('feedback');
      setDialogOpen(false);
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (postId: string, voteType: 1 | -1, currentVote: 1 | -1 | null) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (currentVote === voteType) {
        // Remove vote if clicking the same button
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          }, {
            onConflict: 'post_id,user_id'
          });
          
        if (error) throw error;
      }

      // Refresh posts to update vote counts
      fetchPosts();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!isAdmin) {
      console.log('Not admin, cannot delete. Current role:', profile?.role);
      alert('Only admins can delete posts.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }
      
      // Refresh posts
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      // More detailed error message
      if (error?.message?.includes('policy')) {
        alert('Permission denied. Please ensure you have admin privileges and the database policies are correctly configured.');
      } else {
        alert(`Failed to delete post: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Debug Info - Remove this after testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
          <div>User ID: {user?.id || 'Not logged in'}</div>
          <div>Email: {profile?.email || 'N/A'}</div>
          <div>Role: <span className="font-bold">{profile?.role || 'user'}</span></div>
          <div>Is Admin: <span className="font-bold">{isAdmin ? 'YES' : 'NO'}</span></div>
        </div>
      )}
      
      {/* Header Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Tag Filter */}
            <div className="flex items-center space-x-1">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              {Object.entries(tagConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(key as FeedbackTag)}
                  className={filter === key ? `${config.bg} ${config.color} hover:opacity-90` : ''}
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Create Post Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create a post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Tag Selection */}
                <div className="flex space-x-2">
                  {Object.entries(tagConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTag(key as FeedbackTag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        tag === key
                          ? `${config.bg} ${config.color} ring-2 ring-offset-2 ring-${config.borderColor}`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>

                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-lg"
                />

                <Textarea
                  placeholder="Text (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || !title}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No posts yet. Be the first to share something!
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Card 
              key={post.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/community/${post.id}`}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Vote Section - Reddit Style */}
                  <div className="flex flex-col items-center justify-center w-10 bg-gray-50 py-2">
                    <button
                      className={`p-0 rounded hover:bg-gray-200 transition-colors ${
                        post.user_vote_type === 1 ? 'text-[#FF4500]' : 'text-gray-400 hover:text-[#FF4500]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post.id, 1, post.user_vote_type || null);
                      }}
                      aria-label="Upvote"
                    >
                      <ChevronUp className="w-6 h-6" strokeWidth={2} />
                    </button>
                    <span className={`text-xs font-bold my-1 ${
                      post.user_vote_type === 1 ? 'text-[#FF4500]' : 
                      post.user_vote_type === -1 ? 'text-[#7193FF]' : 
                      'text-gray-700'
                    }`}>
                      {post.score}
                    </span>
                    <button
                      className={`p-0 rounded hover:bg-gray-200 transition-colors ${
                        post.user_vote_type === -1 ? 'text-[#7193FF]' : 'text-gray-400 hover:text-[#7193FF]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post.id, -1, post.user_vote_type || null);
                      }}
                      aria-label="Downvote"
                    >
                      <ChevronDown className="w-6 h-6" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-start space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`${tagConfig[post.tag].bg} ${tagConfig[post.tag].color} border-0 text-xs`}
                        >
                          {tagConfig[post.tag].label}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Posted by {post.author_first_name || 'Anonymous'}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">
                      {post.title}
                    </h3>
                    
                    {post.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}