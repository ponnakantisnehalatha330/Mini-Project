import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import './Admin.css';

export default function Admin() {
  const { API, showToast, loadNotifications } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [form, setForm] = useState({
    name: '', description: '', ministry: '', benefits: '',
    eligibility: '', documents: '', apply_link: '', category: '',
    min_age: 0, max_age: 100, gender: 'all', min_income: 0,
    max_income: 9999999, occupation: 'all', education: 'all',
    is_upcoming: false, launch_date: '', application_start_date: '', application_end_date: ''
  });

  useEffect(() => { fetchSchemes(); }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/schemes`);
      if (res.data.success) setSchemes(res.data.schemes);
    } catch (e) {}
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ministry || !form.category) {
      showToast('Please fill required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/schemes`, form);
      if (res.data.success) {
        showToast('✅ New scheme added! Notification sent to dashboard.', 'success');
        setForm({
          name: '', description: '', ministry: '', benefits: '',
          eligibility: '', documents: '', apply_link: '', category: '',
          min_age: 0, max_age: 100, gender: 'all', min_income: 0,
          max_income: 9999999, occupation: 'all', education: 'all',
          is_upcoming: false, launch_date: '', application_start_date: '', application_end_date: ''
        });
        fetchSchemes();
        loadNotifications();
        setView('list');
      }
    } catch (e) {
      showToast('Failed to add scheme', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/schemes/${id}`);
      showToast('Scheme deleted', 'info');
      fetchSchemes();
      loadNotifications();
    } catch (e) {
      showToast('Failed to delete scheme', 'error');
    }
  };

  const toggleNew = async (scheme) => {
    try {
      await axios.put(`${API}/schemes/${scheme.id}`, { is_new: scheme.is_new ? 0 : 1 });
      showToast(`Marked as ${scheme.is_new ? 'old' : 'new'}`, 'info');
      fetchSchemes();
      loadNotifications();
    } catch (e) {}
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-inner">
            <div>
              <h1>⚙️ Admin Panel</h1>
              <p>Manage government schemes · {schemes.length} total schemes</p>
            </div>
            <button className={`btn btn-${view === 'add' ? 'secondary' : 'primary'} btn-lg`}
              onClick={() => setView(view === 'add' ? 'list' : 'add')}>
              {view === 'add' ? '← Back to List' : '+ Add New Scheme'}
            </button>
          </div>
        </div>
      </div>

      <div className="container admin-body">
        {view === 'add' ? (
          <div className="admin-form-card">
            <div className="admin-form-header">
              <h2>Add New Government Scheme</h2>
              <p>This scheme will appear as a notification on user dashboards</p>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row-3">
                <div className="form-group full-width">
                  <label>Scheme Name <span className="required">*</span></label>
                  <input type="text" name="name" placeholder="e.g. PM Kisan Samman Nidhi" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Ministry / Department <span className="required">*</span></label>
                  <input type="text" name="ministry" placeholder="e.g. Ministry of Agriculture" value={form.ministry} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="employment">Employment</option>
                    <option value="housing">Housing</option>
                    <option value="business">Business</option>
                    <option value="women_welfare">Women Welfare</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Brief description of the scheme..." value={form.description} onChange={handleChange}></textarea>
              </div>

              <div className="form-group full-width">
                <label>Benefits <small>(separate multiple with semicolons)</small></label>
                <textarea name="benefits" rows="2" placeholder="e.g. ₹6000/year in installments; Direct Bank Transfer" value={form.benefits} onChange={handleChange}></textarea>
              </div>

              <div className="form-group full-width">
                <label>Eligibility Criteria <small>(separate with semicolons)</small></label>
                <textarea name="eligibility" rows="2" placeholder="e.g. Indian farmer; Land holding < 2 hectares" value={form.eligibility} onChange={handleChange}></textarea>
              </div>

              <div className="form-group full-width">
                <label>Required Documents <small>(separate with semicolons)</small></label>
                <input type="text" name="documents" placeholder="e.g. Aadhaar Card; Bank Account; Land Records" value={form.documents} onChange={handleChange} />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Official Apply Link</label>
                  <input type="url" name="apply_link" placeholder="https://..." value={form.apply_link} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="all">All</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Launch Date</label>
                  <input type="date" name="launch_date" value={form.launch_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_upcoming"
                      checked={form.is_upcoming}
                      onChange={handleChange}
                      style={{ marginRight: 8 }}
                    />
                    Mark as upcoming (future launch)
                  </label>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Application Start Date</label>
                  <input type="date" name="application_start_date" value={form.application_start_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Application End Date</label>
                  <input type="date" name="application_end_date" value={form.application_end_date} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row-4">
                <div className="form-group">
                  <label>Min Age</label>
                  <input type="number" name="min_age" min="0" max="100" value={form.min_age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Age</label>
                  <input type="number" name="max_age" min="0" max="100" value={form.max_age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Min Income (₹)</label>
                  <input type="number" name="min_income" min="0" value={form.min_income} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Income (₹)</label>
                  <input type="number" name="max_income" min="0" value={form.max_income} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Target Occupation <small>(comma separated or 'all')</small></label>
                  <input type="text" name="occupation" placeholder="e.g. farmer,student or all" value={form.occupation} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Target Education <small>(comma separated or 'all')</small></label>
                  <input type="text" name="education" placeholder="e.g. graduate,student or all" value={form.education} onChange={handleChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setView('list')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Adding...' : '🔔 Add Scheme & Notify Users'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-table-section">
            <div className="admin-table-header">
              <h2>All Schemes</h2>
              <span className="table-count">{schemes.length} total</span>
            </div>
            {loading ? (
              <div className="table-loading">Loading schemes...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Scheme Name</th>
                      <th>Ministry</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div className="scheme-name-cell">
                            <a href={`/schemes/${s.id}`} target="_blank" rel="noreferrer">{s.name}</a>
                          </div>
                        </td>
                        <td><span className="ministry-cell">{s.ministry}</span></td>
                        <td>
                          <span className="cat-chip">{s.category?.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <button
                            className={`status-chip ${s.is_new ? 'new' : 'old'}`}
                            onClick={() => toggleNew(s)}
                            title="Click to toggle NEW status"
                          >
                            {s.is_new ? '🆕 NEW' : '📘 Published'}
                          </button>
                        </td>
                        <td className="date-cell">{new Date(s.date_added).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="action-btns">
                            <a href={`/schemes/${s.id}`} className="action-btn view" target="_blank" rel="noreferrer">👁</a>
                            <button className="action-btn delete" onClick={() => handleDelete(s.id, s.name)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
