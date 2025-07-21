'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  ChevronUp, 
  Plus, 
  AlertCircle, 
  Lightbulb, 
  Heart,
  Zap,
  Clock,
  CheckCircle,
  Pin,
  Filter,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ZebCharacter, StripePattern } from '@/components/brand';
import { formatDistanceToNow } from 'date-fns';
import type { FeedbackTopic, FeedbackType, FeedbackStatus } from '@/types/feedback';

const typeConfig = {
  problem: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Problem' },
  suggestion: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Suggestion' },
  feature_request: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Feature Request' },
  praise: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Praise' }
};

const statusConfig = {
  open: { icon: MessageSquare, color: 'text-gray-600', label: 'Open' },
  in_review: { icon: Clock, color: 'text-yellow-600', label: 'In Review' },
  planned: { icon: TrendingUp, color: 'text-blue-600', label: 'Planned' },
  in_progress: { icon: Zap, color: 'text-purple-600', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  closed: { icon: CheckCircle, color: 'text-gray-400', label: 'Closed' }
};

export default function FeedbackPage() {
  const [topics, setTopics] = useState<FeedbackTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | FeedbackType>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [filter, sortBy]);

  const fetchTopics = async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from('feedback_topics_with_user_info')
        .select('*');

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('upvote_count', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching feedback topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !description) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('feedback_topics')
        .insert({
          user_id: user.id,
          title,
          description,
          type
        });

      if (error) throw error;

      // Reset form
      setTitle('');
      setDescription('');
      setType('suggestion');
      setDialogOpen(false);
      
      // Refresh topics
      fetchTopics();
    } catch (error) {
      console.error('Error creating feedback topic:', error);
      alert('Failed to create feedback topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (topicId: string, hasVoted: boolean) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from('feedback_votes')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Add vote
        const { error } = await supabase
          .from('feedback_votes')
          .insert({
            topic_id: topicId,
            user_id: user.id
          });
          
        if (error) throw error;
      }

      // Refresh topics to update vote counts
      fetchTopics();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-growth-green/10 to-white p-8 border border-growth-green/20">
        <div className="absolute inset-0 opacity-5">
          <StripePattern animation="static" opacity={0.1} color="#00d4aa" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-zebra-black mb-2">
                Beta Feedback Hub
              </h1>
              <p className="text-gray-600">
                Help us build the best email marketing platform for e-commerce
              </p>
            </div>
            <ZebCharacter variant="thinking" size="lg" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-zebra-black">{topics.length}</div>
              <div className="text-sm text-gray-600">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-growth-green">
                {topics.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {topics.filter(t => t.status === 'planned').length}
              </div>
              <div className="text-sm text-gray-600">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {topics.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Topics
          </Button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as FeedbackType)}
                className={filter === key ? 'bg-growth-green hover:bg-growth-green-600' : ''}
              >
                <Icon className="w-4 h-4 mr-1" />
                {config.label}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'newest' | 'popular') => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Feedback Topic</DialogTitle>
                <DialogDescription>
                  Share your feedback to help us improve ZebaMail
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={type} onValueChange={(value: FeedbackType) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              <Icon className={`w-4 h-4 mr-2 ${config.color}`} />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Brief summary of your feedback"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Provide more details about your feedback..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

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
                    disabled={submitting || !title || !description}
                    className="bg-growth-green hover:bg-growth-green-600"
                  >
                    {submitting ? 'Creating...' : 'Create Topic'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="text-center py-12">
          <ZebCharacter variant="loading" size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      ) : topics.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ZebCharacter variant="welcome" size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zebra-black mb-2">
              No feedback topics yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your thoughts!
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-growth-green hover:bg-growth-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Topic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => {
            const TypeIcon = typeConfig[topic.type].icon;
            const StatusIcon = statusConfig[topic.status].icon;
            
            return (
              <Card 
                key={topic.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/feedback/${topic.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Upvote Section */}
                    <div className="flex flex-col items-center">
                      <Button
                        variant={topic.user_has_voted ? 'default' : 'outline'}
                        size="sm"
                        className={`px-2 py-1 ${
                          topic.user_has_voted 
                            ? 'bg-growth-green hover:bg-growth-green-600 text-white' 
                            : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(topic.id, topic.user_has_voted || false);
                        }}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-semibold mt-1">
                        {topic.upvote_count}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {topic.is_pinned && (
                              <Pin className="w-4 h-4 text-growth-green" />
                            )}
                            <h3 className="font-semibold text-lg text-zebra-black">
                              {topic.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 line-clamp-2">
                            {topic.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={`${typeConfig[topic.type].bg} ${typeConfig[topic.type].color} border-0`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeConfig[topic.type].label}
                          </Badge>
                          <Badge variant="outline" className={statusConfig[topic.status].color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[topic.status].label}
                          </Badge>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          by {topic.author_name || 'Beta Tester'}
                          {topic.author_role === 'admin' && (
                            <Badge variant="secondary" className="ml-1 text-xs">Staff</Badge>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {topic.comment_count} comments
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}