import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

const AdminWorkerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showReject, setShowReject] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await api.get(`/admin/workers/${id}`);
                setWorker(data.data);
            } catch (error) {
                console.error(error);
                alert('Failed to fetch worker details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleApprove = async () => {
        if (!confirm('Approve this worker?')) return;
        try {
            await api.patch(`/admin/workers/${id}/approve`);
            alert('Worker Approved!');
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return alert('Reason required');
        try {
            await api.patch(`/admin/workers/${id}/reject`, { reason: rejectionReason });
            alert('Worker Rejected');
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Failed to reject');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!worker) return <p>Worker not found</p>;

    return (
        <div className="worker-details">
            <button onClick={() => navigate('/admin/dashboard')}>&larr; Back</button>
            <h2>{worker.first_name} {worker.last_name}</h2>
            <div className="card">
                <p><strong>Email:</strong> {worker.user.email}</p>
                <p><strong>Phone:</strong> {worker.phone}</p>
                <p><strong>Bio:</strong> {worker.bio}</p>
                <p><strong>Status:</strong> {worker.verification_status}</p>
            </div>

            <div className="card">
                <h3>Specialities</h3>
                <ul>
                    {worker.specialities?.map(ws => (
                        <li key={ws.speciality.speciality_id}>{ws.speciality.name}</li>
                    ))}
                </ul>
            </div>

            <div className="card">
                <h3>Diplomas</h3>
                {worker.diplomas?.length === 0 ? <p>No diplomas uploaded.</p> : (
                    <ul>
                        {worker.diplomas?.map(d => (
                            <li key={d.diploma_id}>
                                <strong>{d.name}</strong> ({d.institution})
                                {/* For encrypted files, we might need a specific download endpoint */}
                                {/* user can verify via name/institution for now, or we'd add download logic later */}
                                <span style={{ marginLeft: '1rem', color: 'gray', fontSize: '0.8rem' }}>
                                    (File ID: {d.file_path.split('/').pop()})
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button onClick={handleApprove} style={{ background: 'green', color: 'white' }}>Approve Worker</button>
                <button onClick={() => setShowReject(!showReject)} style={{ background: 'red', color: 'white' }}>Reject Worker</button>
            </div>

            {showReject && (
                <div className="reject-form" style={{ marginTop: '1rem', border: '1px solid red', padding: '1rem' }}>
                    <label>Reason for rejection:</label>
                    <textarea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        style={{ width: '100%', minHeight: '60px' }}
                    />
                    <button onClick={handleReject} style={{ marginTop: '0.5rem' }}>Confirm Rejection</button>
                </div>
            )}
        </div>
    );
};

export default AdminWorkerDetails;
