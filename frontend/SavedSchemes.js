import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SchemeCard from '../components/SchemeCard';
import './SavedSchemes.css';

export default function SavedSchemes() {
  const { user, savedSchemes } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="saved-page">
        <div className="saved-empty container">
          <div className="empty-icon">🔒</div>
          <h2>Profile Required</h2>
          <p>Please create your profile first to save schemes.</p>
          <Link to="/" className="btn btn-primary btn-lg">Create Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      {/* Header */}
      <div className="saved-header">
        <div className="container">
          <h1>🔖 Saved Schemes</h1>
          <p>{savedSchemes.length} scheme{savedSchemes.length !== 1 ? 's' : ''} saved · {user.name}</p>
        </div>
      </div>

      <div className="container saved-body">
        {savedSchemes.length === 0 ? (
          <div className="saved-empty-state">
            <div className="empty-icon">📌</div>
            <h3>No saved schemes yet</h3>
            <p>Browse schemes and click the 📌 button to save them here</p>
            <div className="empty-actions">
              <Link to="/recommendations" className="btn btn-primary btn-lg">View Recommendations</Link>
              <Link to="/schemes" className="btn btn-secondary btn-lg">Browse All Schemes</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="saved-info-bar">
              <span>✅ Your saved schemes are stored securely. Apply anytime!</span>
            </div>
            <div className="saved-grid">
              {savedSchemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
