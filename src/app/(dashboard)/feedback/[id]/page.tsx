'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  ChevronUp, 
  MessageSquare, 
  ArrowLeft,
  Send,
  AlertCircle, 
  Lightbulb, 
  Heart,
  Zap,
  Clock,
  CheckCircle,
  Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ZebCharacter } from '@/components/brand';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackTopic, FeedbackComment } from '@/types/feedback';

const typeConfig = {
  problem: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Problem' },
  suggestion: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Suggestion' },
  feature_request: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Feature Request' },
  praise: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Praise' }
};

const statusConfig = {
  open: { icon: MessageSquare, color: 'text-gray-600', label: 'Open' },
  in_review: { icon: Clock, color: 'text-yellow-600', label: 'In Review' },
  planned: { icon: Zap, color: 'text-blue-600', label: 'Planned' },
  in_progress: { icon: Zap, color: 'text-purple-600', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  closed: { icon: CheckCircle, color: 'text-gray-400', label: 'Closed' }
};

export default function FeedbackTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [topic, setTopic] = useState<FeedbackTopic | null>(null);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTopic(params.id as string);
      fetchComments(params.id as string);
    }
  }, [params.id]);

  const fetchTopic = async (id: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('feedback_topics_with_user_info')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTopic(data);
    } catch (error) {
      console.error('Error fetching topic:', error);
      router.push('/feedback');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (topicId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('feedback_comments')
        .select(`
          *,
          user_profiles!feedback_comments_user_id_fkey (
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map the joined data
      const mappedComments = data?.map((comment: any) => ({
        ...comment,
        author_name: comment.user_profiles?.full_name,
        author_avatar: comment.user_profiles?.avatar_url,
        author_role: comment.user_profiles?.role
      })) || [];
      
      setComments(mappedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async () => {
    if (!user || !topic) return;

    try {
      const supabase = createClient();
      
      if (topic.user_has_voted) {
        // Remove vote
        const { error } = await supabase
          .from('feedback_votes')
          .delete()
          .eq('topic_id', topic.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Add vote
        const { error } = await supabase
          .from('feedback_votes')
          .insert({
            topic_id: topic.id,
            user_id: user.id
          });
          
        if (error) throw error;
      }

      // Refresh topic to update vote status
      fetchTopic(topic.id);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !comment.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_comments')
        .insert({
          topic_id: topic.id,
          user_id: user.id,
          content: comment
        });

      if (error) throw error;

      // Reset form and refresh
      setComment('');
      fetchComments(topic.id);
      fetchTopic(topic.id); // To update comment count
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <ZebCharacter variant="loading" size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  const TypeIcon = typeConfig[topic.type].icon;
  const StatusIcon = statusConfig[topic.status].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/feedback')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feedback
      </Button>

      {/* Topic Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Upvote Section */}
            <div className="flex flex-col items-center">
              <Button
                variant={topic.user_has_voted ? 'default' : 'outline'}
                size="sm"
                className={`px-3 py-2 ${
                  topic.user_has_voted 
                    ? 'bg-growth-green hover:bg-growth-green-600 text-white' 
                    : ''
                }`}
                onClick={handleVote}
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              <span className="text-lg font-semibold mt-1">
                {topic.upvote_count}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${typeConfig[topic.type].bg} ${typeConfig[topic.type].color} border-0`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeConfig[topic.type].label}
                </Badge>
                <Badge variant="outline" className={statusConfig[topic.status].color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[topic.status].label}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-zebra-black mb-2">
                {topic.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={topic.author_avatar}
                    alt={topic.author_name || 'User'}
                    fallback={topic.author_name || 'U'}
                    size="sm"
                  />
                  <span>
                    {topic.author_name || 'Beta Tester'}
                    {topic.author_role === 'admin' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Staff
                      </Badge>
                    )}
                  </span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">
                {topic.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Comments ({topic.comment_count})
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <ZebCharacter variant="thinking" size="md" className="mx-auto mb-4" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={comment.author_avatar}
                    alt={comment.author_name || 'User'}
                    fallback={comment.author_name || 'U'}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author_name || 'Beta Tester'}
                      </span>
                      {comment.author_role === 'admin' && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Staff
                        </Badge>
                      )}
                      {comment.is_staff_response && (
                        <Badge className="bg-growth-green/10 text-growth-green text-xs">
                          Official Response
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mt-6 pt-4 border-t">
              <Textarea
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting || !comment.trim()}
                  className="bg-growth-green hover:bg-growth-green-600"
                >
                  {submitting ? 'Posting...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 border-t">
              <p className="text-gray-600">Please sign in to comment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}