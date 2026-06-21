import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import SchemeCard from '../components/SchemeCard';
import './Recommendations.css';

export default function Recommendations() {
  const { user, API, profiles, selectUserProfile } = useApp();
  const navigate = useNavigate();
  const [eligibleSchemes, setEligibleSchemes] = useState([]);
  const [upcomingSchemes, setUpcomingSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('eligible');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchRecommendations();
  }, [user?.user_id]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/schemes/recommend`, {
        age: user.age,
        gender: user.gender,
        state: user.state,
        category: user.category,
        occupation: user.occupation,
        annual_income: user.annual_income,
        education: user.education
      });
      if (res.data.success) {
        setEligibleSchemes(res.data.eligible_schemes || []);
        setUpcomingSchemes(res.data.upcoming_schemes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeList = filter === 'upcoming' ? upcomingSchemes : eligibleSchemes;
  const categories = ['all', ...new Set(activeList.map(s => s.category))];
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filtered = categoryFilter === 'all' ? activeList : activeList.filter(s => s.category === categoryFilter);

  return (
    <div className="reco-page">
      <div className="reco-header">
        <div className="container">
          <div className="reco-hero">
            <div className="reco-hero-left">
              <div className="reco-badge">🤖 AI Recommendations</div>
              <h1>Schemes For <span className="highlight-name">{user?.name}</span></h1>
              <p>Based on your profile in <strong>{user?.state}</strong> · {user?.occupation} · Age {user?.age}</p>
              {profiles.length > 1 && (
                <div style={{ marginTop: 12 }}>
                  <select
                    value={user?.user_id}
                    onChange={(e) => selectUserProfile(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: '1px solid #d6dee8' }}
                  >
                    {profiles.map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.name} - {p.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="reco-hero-right">
              <div className="reco-count-card">
                <div className="count-big">{eligibleSchemes.length}</div>
                <div className="count-label">Eligible Now</div>
                <div style={{ marginTop: 8, fontWeight: 700, color: '#0d5f8f' }}>
                  {upcomingSchemes.length} Upcoming Matches
                </div>
                <button className="btn btn-secondary" style={{marginTop:10, width:'100%', justifyContent:'center'}} onClick={() => navigate('/')}>
                  Manage Profiles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container reco-body">
        <div className="filter-tabs" style={{ marginBottom: 8 }}>
          <button
            className={`filter-tab ${filter === 'eligible' ? 'active' : ''}`}
            onClick={() => {
              setFilter('eligible');
              setCategoryFilter('all');
            }}
          >
            Eligible Now <span className="tab-count">{eligibleSchemes.length}</span>
          </button>
          <button
            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => {
              setFilter('upcoming');
              setCategoryFilter('all');
            }}
          >
            Future Launches <span className="tab-count">{upcomingSchemes.length}</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? '📋 All' : cat.replace('_', ' ')}
              <span className="tab-count">
                {cat === 'all' ? activeList.length : activeList.filter(s => s.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton" style={{height:60, marginBottom:12}}></div>
                <div className="skeleton" style={{height:20, marginBottom:8}}></div>
                <div className="skeleton" style={{height:20, width:'60%', marginBottom:16}}></div>
                <div className="skeleton" style={{height:14, marginBottom:6}}></div>
                <div className="skeleton" style={{height:14, marginBottom:6}}></div>
                <div className="skeleton" style={{height:38, marginTop:16}}></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>{filter === 'upcoming' ? 'No upcoming schemes for this profile' : 'No eligible schemes found'}</h3>
            <p>{filter === 'upcoming' ? 'Try another saved profile to see future matches' : 'Try updating your profile or browse all schemes'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/schemes')}>Browse All Schemes</button>
          </div>
        ) : (
          <div className="schemes-grid">
            {filtered.map(s => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
