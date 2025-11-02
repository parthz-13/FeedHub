import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getFeedbacks, createFeedback, upvoteFeedback } from "../services/api";
import FeedbackCard from "../components/FeedbackCard";

export default function Home() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature",
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const { data } = await getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to create feedback");

    try {
      await createFeedback(formData);
      setFormData({ title: "", description: "", category: "feature" });
      setShowForm(false);
      loadFeedbacks();
    } catch (err) {
      alert("Error creating feedback");
      console.log(err);
    }
  };

  const handleUpvote = async (id) => {
    if (!user) return alert("Please login to upvote");

    try {
      await upvoteFeedback(id);
      loadFeedbacks();
    } catch (err) {
      console.error("Error upvoting:", err);
    }
  };

  return (
    <div className="home">
      <div className="header">
        <h1>Feedback Board</h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Feedback"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="feedback-form">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="feature">Feature</option>
            <option value="bug">Bug</option>
            <option value="improvement">Improvement</option>
          </select>
          <button type="submit">Submit Feedback</button>
        </form>
      )}

      <div className="feedback-list">
        {feedbacks.map((fb) => (
          <FeedbackCard key={fb.id} feedback={fb} onUpvote={handleUpvote} />
        ))}
      </div>
    </div>
  );
}
