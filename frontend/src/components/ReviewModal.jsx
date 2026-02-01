import { useState } from 'react';
import api from '../api/client';

const ReviewModal = ({ missionId, targetId, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert('Please select a rating');

        setSubmitting(true);
        try {
            await api.post('/reviews/create', {
                mission_id: missionId,
                target_id: targetId,
                rating,
                comment
            });
            alert('Review submitted!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
                <h3>Write a Review</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ margin: '1rem 0' }}>
                        <label>Rating:</label>
                        <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ color: star <= rating ? 'gold' : 'gray' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ margin: '1rem 0' }}>
                        <label>Comment:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{ width: '100%', minHeight: '100px', display: 'block' }}
                        />
                    </div>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button type="button" onClick={onClose} style={{ marginLeft: '1rem', background: 'gray' }}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
