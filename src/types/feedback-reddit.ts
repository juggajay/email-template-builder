// Reddit-style feedback system types
export type FeedbackTag = 'bug' | 'feature' | 'feedback' | 'discussion';

export interface FeedbackPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tag: FeedbackTag;
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  // From the view
  author_first_name?: string;
  author_avatar?: string;
  user_vote_type?: 1 | -1 | null; // 1 for upvote, -1 for downvote, null for no vote
}

export interface FeedbackComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;
  // From the view
  author_first_name?: string;
  author_avatar?: string;
  user_vote_type?: 1 | -1 | null;
  // For nested comments
  replies?: FeedbackComment[];
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

export interface CommentVote {
  id: string;
  comment_id: string;
  user_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

// Tag configuration for UI
export const tagConfig = {
  bug: { 
    label: 'Bug', 
    color: 'text-red-600', 
    bg: 'bg-red-100',
    borderColor: 'border-red-300'
  },
  feature: { 
    label: 'Feature', 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    borderColor: 'border-purple-300'
  },
  feedback: { 
    label: 'Feedback', 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  discussion: { 
    label: 'Discussion', 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    borderColor: 'border-green-300'
  }
};