import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './SchemeCard.css';

const CATEGORY_ICONS = {
  agriculture: '🌾',
  education: '🎓',
  employment: '💼',
  housing: '🏠',
  health: '🏥',
  women_welfare: '👩',
  business: '💰',
  default: '📋'
};

const CATEGORY_COLORS = {
  agriculture: '#2e7d32',
  education: '#1565c0',
  employment: '#e65100',
  housing: '#6a1b9a',
  health: '#c62828',
  women_welfare: '#ad1457',
  business: '#f57f17'
};

export default function SchemeCard({ scheme, compact = false }) {
  const { API, saveScheme, removeSavedScheme, isSaved } = useApp();
  const saved = isSaved(scheme.id);
  const icon = CATEGORY_ICONS[scheme.category] || CATEGORY_ICONS.default;
  const color = CATEGORY_COLORS[scheme.category] || '#1a4b8c';
  const isUpcoming = Boolean(scheme.is_upcoming);

  const handleApply = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const applyUrl = `${API}/schemes/${scheme.id}/apply`;
    if (!applyUrl) return;
    window.open(applyUrl, '_blank');
  };

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Check if scheme is starting applications today
  const today = new Date().toISOString().split('T')[0];
  const isStartingToday = scheme.application_start_date && scheme.application_start_date.startsWith(today);

  return (
    <div className={`scheme-card ${compact ? 'compact' : ''} fade-in ${isStartingToday ? 'starting-today' : ''}`}>
      {scheme.is_new && <div className="scheme-ribbon">NEW</div>}
      {isStartingToday && <div className="scheme-ribbon starting-today-ribbon">🔔 APPLY TODAY</div>}
      <div className="scheme-card-header" style={{ '--accent': color }}>
        <div className="scheme-icon" style={{ background: color + '15', color }}>
          {icon}
        </div>
        <div className="scheme-meta">
          <div className="scheme-category badge" style={{ background: color + '15', color }}>
            {scheme.category?.replace('_', ' ')?.toUpperCase()}
          </div>
          {scheme.score && (
            <div className="scheme-match">
              <div className="match-bar">
                <div className="match-fill" style={{ width: `${Math.min(scheme.score, 100)}%` }}></div>
              </div>
              <span>{Math.min(scheme.score, 100)}% match</span>
            </div>
          )}
        </div>
      </div>

      <div className="scheme-card-body">
        <h3 className="scheme-name">{scheme.name}</h3>
        <p className="scheme-ministry">🏛️ {scheme.ministry}</p>
        <p className="scheme-ministry">
          {isUpcoming ? '🚀 Launches' : '📅 Launched'}: {formatDate(scheme.launch_date) || 'TBA'}
        </p>
        {!isUpcoming && (
          <p className="scheme-application-dates">
            📝 Application: {formatDate(scheme.application_start_date) || 'Available'} 
            {scheme.application_end_date ? ` to ${formatDate(scheme.application_end_date)}` : ' • Apply Anytime'}
          </p>
        )}
        {!compact && (
          <p className="scheme-desc">{scheme.description}</p>
        )}

        {scheme.reasons && scheme.reasons.length > 0 && (
          <div className="scheme-reasons">
            {scheme.reasons.slice(0, 2).map((r, i) => (
              <span key={i} className="reason-tag">✓ {r}</span>
            ))}
          </div>
        )}
      </div>

      <div className="scheme-card-footer">
        <Link to={`/schemes/${scheme.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          View Details
        </Link>
        <button
          type="button"
          onClick={handleApply}
          className="btn btn-success"
          title={isUpcoming ? 'Open official portal' : 'Apply now on official portal'}
        >
          {isUpcoming ? 'Open Portal →' : 'Apply →'}
        </button>
        <button
          className={`btn-save ${saved ? 'saved' : ''}`}
          onClick={() => saved ? removeSavedScheme(scheme.id) : saveScheme(scheme.id)}
          title={saved ? 'Remove from saved' : 'Save scheme'}
        >
          {saved ? '🔖' : '📌'}
        </button>
      </div>
    </div>
  );
}
