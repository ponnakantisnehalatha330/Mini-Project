import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import './SchemeDetail.css';

const CATEGORY_ICONS = {
  agriculture: '🌾', education: '🎓', employment: '💼',
  housing: '🏠', health: '🏥', women_welfare: '👩',
  business: '💰', default: '📋'
};

export default function SchemeDetail() {
  const { id } = useParams();
  const { API, saveScheme, removeSavedScheme, isSaved } = useApp();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheme();
  }, [id]);

  const fetchScheme = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schemes/${id}`);
      if (res.data.success) setScheme(res.data.scheme);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="detail-loading container">
      <div className="skeleton" style={{height:200, borderRadius: 16, marginBottom:24}}></div>
      <div className="skeleton" style={{height:400, borderRadius: 16}}></div>
    </div>
  );

  if (!scheme) return (
    <div className="detail-error container">
      <h2>Scheme not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/schemes')}>Back to Schemes</button>
    </div>
  );

  const icon = CATEGORY_ICONS[scheme.category] || CATEGORY_ICONS.default;
  const saved = isSaved(scheme.id);
  const isUpcoming = Boolean(scheme.is_upcoming);

  const handleApply = (e) => {
    e.preventDefault();
    const applyUrl = `${API}/schemes/${scheme.id}/apply`;
    if (!applyUrl) return;
    window.open(applyUrl, '_blank');
  };

  const parseList = (str) => str ? str.split(';').map(s => s.trim()).filter(Boolean) : [];
  const formatDate = (value) => {
    if (!value) return 'TBA';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb container">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <span>/</span>
        <span>{scheme.name}</span>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div className="container">
          <div className="detail-hero-inner">
            <div className="detail-icon">{icon}</div>
            <div className="detail-hero-content">
              <div className="detail-tags">
                <span className="badge badge-category">{scheme.category?.replace('_', ' ')?.toUpperCase()}</span>
                {scheme.is_new ? <span className="badge badge-new">🆕 NEW</span> : null}
                {isUpcoming ? <span className="badge badge-new">🚀 UPCOMING</span> : null}
              </div>
              <h1 className="detail-title">{scheme.name}</h1>
              <p className="detail-ministry">🏛️ {scheme.ministry}</p>
              <p className="detail-ministry">
                📅 Launch Date: {formatDate(scheme.launch_date)}
              </p>
              <p className="detail-ministry detail-application-period">
                📝 Application Period: {formatDate(scheme.application_start_date)}
                {scheme.application_end_date ? ` to ${formatDate(scheme.application_end_date)}` : ' • Apply Anytime'}
              </p>
              <p className="detail-desc">{scheme.description}</p>
            </div>
            <div className="detail-actions">
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-success btn-lg"
              >
                {isUpcoming ? 'Open Official Portal →' : 'Apply Now →'}
              </button>
              <button
                className={`btn ${saved ? 'btn-danger' : 'btn-secondary'} btn-lg`}
                onClick={() => saved ? removeSavedScheme(scheme.id) : saveScheme(scheme.id)}
              >
                {saved ? '🔖 Saved' : '📌 Save Scheme'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="container detail-body">
        <div className="detail-grid">
          {/* Benefits */}
          <div className="detail-card">
            <div className="detail-card-header benefits">
              <span>💰</span> Benefits
            </div>
            <div className="detail-card-body">
              <ul className="detail-list">
                {parseList(scheme.benefits).map((b, i) => (
                  <li key={i}><span className="list-check">✓</span>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Eligibility */}
          <div className="detail-card">
            <div className="detail-card-header eligibility">
              <span>✅</span> Eligibility Criteria
            </div>
            <div className="detail-card-body">
              <ul className="detail-list">
                {parseList(scheme.eligibility).map((e, i) => (
                  <li key={i}><span className="list-check">→</span>{e}</li>
                ))}
              </ul>
              <div className="eligibility-meta">
                <div className="meta-tag">
                  <span>👤 Age</span>
                  <strong>{scheme.min_age} – {scheme.max_age === 100 ? 'Any' : scheme.max_age} yrs</strong>
                </div>
                <div className="meta-tag">
                  <span>⚧ Gender</span>
                  <strong style={{textTransform:'capitalize'}}>{scheme.gender === 'all' ? 'All' : scheme.gender}</strong>
                </div>
                <div className="meta-tag">
                  <span>💵 Income</span>
                  <strong>
                    {scheme.max_income >= 9999999
                      ? 'No Limit'
                      : `Up to ₹${(scheme.max_income / 100000).toFixed(1)}L`}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Application Period */}
          <div className="detail-card">
            <div className="detail-card-header application-dates">
              <span>📋</span> Application Period
            </div>
            <div className="detail-card-body">
              <div className="application-info">
                <div className="app-info-row">
                  <span className="app-label">📅 Application Start Date</span>
                  <strong className="app-value">{formatDate(scheme.application_start_date)}</strong>
                </div>
                <div className="app-info-row">
                  <span className="app-label">⏰ Deadline</span>
                  <strong className="app-value deadline-value">
                    {scheme.application_end_date 
                      ? formatDate(scheme.application_end_date)
                      : '⭐ No Deadline - Apply Anytime'
                    }
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="detail-card">
            <div className="detail-card-header documents">
              <span>📄</span> Required Documents
            </div>
            <div className="detail-card-body">
              <div className="doc-tags">
                {parseList(scheme.documents).map((d, i) => (
                  <span key={i} className="doc-tag">📎 {d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Apply */}
          <div className="detail-card apply-card">
            <div className="detail-card-header apply">
              <span>🚀</span> How to Apply
            </div>
            <div className="detail-card-body">
              <div className="apply-steps">
                <div className="apply-step"><div className="step-circle">1</div><span>Collect all required documents listed above</span></div>
                <div className="apply-step"><div className="step-circle">2</div><span>Visit the official scheme portal</span></div>
                <div className="apply-step"><div className="step-circle">3</div><span>Fill in the application form with your details</span></div>
                <div className="apply-step"><div className="step-circle">4</div><span>Submit and track your application</span></div>
              </div>
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-success btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              >
                Go to MyScheme →
              </button>
              <p className="apply-note">
                🔗 Search for: <strong>{scheme.name}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
