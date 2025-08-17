'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown,
  MessageSquare, 
  ArrowLeft,
  Send,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackPost, FeedbackComment } from '@/types/feedback-reddit';
import { tagConfig } from '@/types/feedback-reddit';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [post, setPost] = useState<FeedbackPost | null>(null);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
      fetchComments(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('feedback_posts_with_user_info')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/community');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('feedback_comments_with_user_info')
        .select('*')
        .eq('post_id', postId)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Organize comments into a tree structure
      const commentMap = new Map<string, FeedbackComment>();
      const rootComments: FeedbackComment[] = [];
      
      data?.forEach((comment: FeedbackComment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });
      
      data?.forEach((comment: FeedbackComment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      
      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePostVote = async (voteType: 1 | -1) => {
    if (!user || !post) return;

    try {
      const supabase = createClient();
      
      if (post.user_vote_type === voteType) {
        // Remove vote
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType
          }, {
            onConflict: 'post_id,user_id'
          });
          
        if (error) throw error;
      }

      // Refresh post
      fetchPost(post.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentVote = async (commentId: string, voteType: 1 | -1, currentVote: 1 | -1 | null) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (currentVote === voteType) {
        // Remove vote
        const { error } = await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('comment_votes')
          .upsert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
          }, {
            onConflict: 'comment_id,user_id'
          });
          
        if (error) throw error;
      }

      // Refresh comments
      if (post) fetchComments(post.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user || !post) return;

    const content = parentId ? replyContent : comment;
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          parent_id: parentId || null,
          content: content
        });

      if (error) throw error;

      // Reset forms
      if (parentId) {
        setReplyContent('');
        setReplyTo(null);
      } else {
        setComment('');
      }
      
      // Refresh
      fetchComments(post.id);
      fetchPost(post.id);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!isAdmin || !post) {
      console.log('Not admin or no post. Admin status:', isAdmin, 'Role:', profile?.role);
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
        .eq('id', post.id);
      
      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }
      
      // Redirect to community page after deletion
      router.push('/community');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      if (error?.message?.includes('policy')) {
        alert('Permission denied. Please ensure you have admin privileges and the database policies are correctly configured.');
      } else {
        alert(`Failed to delete post: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Refresh comments
      if (post) {
        fetchComments(post.id);
        fetchPost(post.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const renderComment = (comment: FeedbackComment, depth: number = 0) => (
    <div key={comment.id} className={depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}>
      <div className="flex space-x-2 mb-2">
        {/* Vote buttons - Reddit Style */}
        <div className="flex flex-col items-center min-w-[24px]">
          <button
            className={`p-0 rounded hover:bg-gray-100 transition-colors ${
              comment.user_vote_type === 1 ? 'text-[#FF4500]' : 'text-gray-400 hover:text-[#FF4500]'
            }`}
            onClick={() => handleCommentVote(comment.id, 1, comment.user_vote_type || null)}
            aria-label="Upvote"
          >
            <ChevronUp className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className={`text-[10px] font-bold leading-none my-0.5 ${
            comment.user_vote_type === 1 ? 'text-[#FF4500]' : 
            comment.user_vote_type === -1 ? 'text-[#7193FF]' : 
            'text-gray-600'
          }`}>
            {comment.score}
          </span>
          <button
            className={`p-0 rounded hover:bg-gray-100 transition-colors ${
              comment.user_vote_type === -1 ? 'text-[#7193FF]' : 'text-gray-400 hover:text-[#7193FF]'
            }`}
            onClick={() => handleCommentVote(comment.id, -1, comment.user_vote_type || null)}
            aria-label="Downvote"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">{comment.author_first_name || 'Anonymous'}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
            </div>
            {isAdmin && (
              <button
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => handleDeleteComment(comment.id)}
                title="Delete comment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          >
            Reply
          </button>

          {/* Reply form */}
          {replyTo === comment.id && (
            <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="mt-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="text-sm mb-2"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={submitting || !replyContent.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Reply
                </Button>
              </div>
            </form>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/community')}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      {/* Post */}
      <Card>
        <CardContent className="p-0">
          <div className="flex">
            {/* Vote Section - Reddit Style */}
            <div className="flex flex-col items-center justify-center w-12 bg-gray-50 py-3">
              <button
                className={`p-0 rounded hover:bg-gray-200 transition-colors ${
                  post.user_vote_type === 1 ? 'text-[#FF4500]' : 'text-gray-400 hover:text-[#FF4500]'
                }`}
                onClick={() => handlePostVote(1)}
                aria-label="Upvote"
              >
                <ChevronUp className="w-7 h-7" strokeWidth={2} />
              </button>
              <span className={`text-sm font-bold my-1 ${
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
                onClick={() => handlePostVote(-1)}
                aria-label="Downvote"
              >
                <ChevronDown className="w-7 h-7" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-3">
                {post.title}
              </h1>
              
              {post.content && (
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {post.content}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      {user && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={(e) => handleCommentSubmit(e)}>
              <Textarea
                placeholder="What are your thoughts?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting || !comment.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {submitting ? 'Posting...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4 flex items-center text-gray-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            {post.comment_count} Comments
          </h2>
          
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}