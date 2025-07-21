export type FeedbackType = 'problem' | 'suggestion' | 'feature_request' | 'praise';
export type FeedbackStatus = 'open' | 'in_review' | 'planned' | 'in_progress' | 'completed' | 'closed';

export interface FeedbackTopic {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  upvote_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // From the view
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  user_has_voted?: boolean;
}

export interface FeedbackComment {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  is_staff_response: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
}

export interface FeedbackVote {
  id: string;
  topic_id: string;
  user_id: string;
  created_at: string;
}