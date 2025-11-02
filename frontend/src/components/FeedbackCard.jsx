import { Link } from 'react-router-dom';

export default function FeedbackCard({ feedback, onUpvote }) {
  return (
    <div className="feedback-card">
      <div className="upvote-section">
        <button onClick={() => onUpvote(feedback.id)} className="upvote-btn">
          ▲
        </button>
        <span>{feedback.upvotes}</span>
      </div>
      
      <div className="feedback-content">
        <Link to={`/feedback/${feedback.id}`}>
          <h3>{feedback.title}</h3>
        </Link>
        <p>{feedback.description}</p>
        <div className="feedback-meta">
          <span className="category">{feedback.category}</span>
          <span className="status">{feedback.status}</span>
          <span className="author">By {feedback.user.name}</span>
          <span className="comments">{feedback._count.comments} comments</span>
        </div>
      </div>
    </div>
  );
}