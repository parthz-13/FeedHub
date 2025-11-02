import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComments, createComment } from '../services/api';

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [id]);

  const loadComments = async () => {
    try {
      const { data } = await getComments(id);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createComment(id, { content: newComment });
      setNewComment('');
      loadComments();
    } catch (err) {
      alert('Error posting comment');
      console.log(err)
    }
  };

  return (
    <div className="feedback-detail">
      <button onClick={() => navigate('/')}>← Back</button>
      
      <h2>Comments</h2>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Post Comment</button>
      </form>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <strong>{comment.user.name}</strong>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}