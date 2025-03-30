import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

interface Comment {
  id: number;
  content: string;
  username: string;
  commented_at: string;
}

interface CommentsProps {
  restaurantId: string;
  isAuthenticated: boolean;
  onLogin: () => void;
}

const Comments = ({ restaurantId, isAuthenticated, onLogin }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch comments when component mounts or restaurantId changes
  useEffect(() => {
    fetchComments();
  }, [restaurantId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/comments/${restaurantId}`);
      setComments(response.data.comments || []);
      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await axios.post(`/api/comments/${restaurantId}`, 
        { content: newComment },
        { headers: { apiKey: localStorage.getItem('api_key') || '' } }
      );
      
      // Add the new comment to the top of the list
      setComments([response.data, ...comments]);
      setNewComment('');
      setError('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? "Leave a comment..." : "Sign in to comment"}
          className="comment-input"
          disabled={submitting || !isAuthenticated}
        />
        {error && <div className="comment-error">{error}</div>}
        <button 
          type="submit" 
          className="comment-submit"
          disabled={submitting || !newComment.trim() || !isAuthenticated}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
      
      {/* Comments list */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-username">{comment.username}</span>
                <span className="comment-date">{formatDate(comment.commented_at)}</span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))
        ) : (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  );
};

export default Comments;
