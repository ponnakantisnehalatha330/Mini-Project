import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SchemeCard from '../components/SchemeCard';
import './Schemes.css';

const CATEGORIES = [
  { id: '', label: 'All Categories', icon: '📋' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'employment', label: 'Employment', icon: '💼' },
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'business', label: 'Business', icon: '💰' },
  { id: 'women_welfare', label: 'Women Welfare', icon: '👩' },
];

export default function Schemes() {
  const { API, user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [debounced, setDebounced] = useState('');
  const [mode, setMode] = useState(user ? 'eligible' : 'all');

  useEffect(() => {
    if (!user && mode !== 'all') setMode('all');
  }, [user, mode]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchSchemes();
  }, [debounced, category, mode, user?.user_id]);

  const matchesSearch = (scheme, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [scheme.name, scheme.description, scheme.ministry]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q));
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      if (mode === 'future' && user) {
        // Fetch future schemes (all future + newly added) from future-schemes endpoint
        const params = new URLSearchParams({
          userId: user.user_id,
          age: user.age,
          gender: user.gender,
          state: user.state,
          category: user.category || 'General',
          occupation: user.occupation,
          annual_income: user.annual_income || 0,
          education: user.education
        });
        const res = await axios.get(`${API}/schemes/future-schemes?${params.toString()}`);
        if (res.data.success) {
          const filtered = res.data.schemes.filter(s => 
            (!category || s.category === category) && matchesSearch(s, debounced)
          );
          setSchemes(filtered);
        }
      } else if (mode !== 'all' && user) {
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
          const source = mode === 'upcoming' ? (res.data.upcoming_schemes || []) : (res.data.eligible_schemes || []);
          const filtered = source.filter((s) => (!category || s.category === category) && matchesSearch(s, debounced));
          setSchemes(filtered);
        }
      } else {
        const params = {};
        if (debounced) params.search = debounced;
        if (category) params.category = category;
        const res = await axios.get(`${API}/schemes`, { params });
        if (res.data.success) setSchemes(res.data.schemes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div className="schemes-page">
      {/* Page Header */}
      <div className="schemes-header">
        <div className="container">
          <h1>Government Schemes</h1>
          <p>Browse all available government schemes. Use filters to narrow your search.</p>
        </div>
      </div>

      <div className="container schemes-layout">
        {/* Sidebar Filters */}
        <aside className="schemes-sidebar">
          <div className="sidebar-card">
            <h3>Categories</h3>
            <div className="cat-filter-list">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`cat-filter-btn ${category === c.id ? 'active' : ''}`}
                  onClick={() => handleCategory(c.id)}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                  <span className="cf-arrow">›</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="schemes-main">
          {user && (
            <div className="filter-tabs" style={{ marginBottom: 12 }}>
              <button className={`filter-tab ${mode === 'eligible' ? 'active' : ''}`} onClick={() => setMode('eligible')}>
                Eligible For {user.name}
              </button>
              <button className={`filter-tab ${mode === 'future' ? 'active' : ''}`} onClick={() => setMode('future')}>
                🎉 Future Schemes
              </button>
              <button className={`filter-tab ${mode === 'all' ? 'active' : ''}`} onClick={() => setMode('all')}>
                All Schemes
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search schemes by name, ministry, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Results Header */}
          <div className="results-header">
            <span className="results-count">
              {loading ? 'Loading...' : `${schemes.length} scheme${schemes.length !== 1 ? 's' : ''} found`}
            </span>
            {(search || category) && (
              <button className="clear-filters" onClick={() => { setSearch(''); handleCategory(''); }}>
                Clear filters ✕
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="schemes-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton" style={{height:60, marginBottom:12}}></div>
                  <div className="skeleton" style={{height:20, marginBottom:8}}></div>
                  <div className="skeleton" style={{height:40, marginBottom:16}}></div>
                  <div className="skeleton" style={{height:38, marginTop:16}}></div>
                </div>
              ))}
            </div>
          ) : schemes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No schemes found</h3>
              <p>Try different keywords or clear the filters</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); handleCategory(''); }}>
                Show All Schemes
              </button>
            </div>
          ) : (
            <div className="schemes-grid">
              {schemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
