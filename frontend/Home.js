import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Home.css';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

export default function Home() {
  const {
    user,
    profiles,
    createUser,
    selectUserProfile,
    deleteUserProfile,
    notifications,
    notificationCount,
    showToast
  } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', gender: '', state: '', category: '',
    occupation: '', annual_income: '', education: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender || !form.state || !form.education || !form.occupation) {
      showToast('Please fill all required fields (Name, Age, Gender, State, Education, Occupation)', 'error');
      return;
    }
    setLoading(true);
    try {
      await createUser(form);
      showToast(`Welcome, ${form.name}! Finding your schemes...`, 'success');
      setForm({
        name: '', age: '', gender: '', state: '', category: '',
        occupation: '', annual_income: '', education: ''
      });
      setTimeout(() => navigate('/recommendations'), 800);
    } catch (err) {
      showToast('Failed to create profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg">
          <div className="hero-stripe saffron"></div>
          <div className="hero-stripe white"></div>
          <div className="hero-stripe green"></div>
        </div>
        <div className="hero-content container">
          <div className="hero-badge">🤖 AI Official Government Schemes Portal</div>
          <h1 className="hero-title">
            Discover Schemes<br />
            <span className="hero-highlight">Made For You</span>
          </h1>
          <p className="hero-sub">
            Enter your details once. Get personalized government scheme recommendations
            across agriculture, education, health, business and more.
          </p>
          <div className="hero-stats">
            <div className="stat"><span>100+</span> Schemes</div>
            <div className="stat-divider"></div>
            <div className="stat"><span>7+</span> Categories</div>
            <div className="stat-divider"></div>
            <div className="stat"><span>AI</span> Powered</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-main container">
        {/* Form Section */}
        <div className="form-section" id="form-section">
          <div className="form-card">
            <div className="form-card-header">
              <h2>
                {user ? 'Add Another Profile' : 'Enter Your Details'}
              </h2>
              <p>Create one or more profiles to get personalized scheme recommendations for each person</p>
            </div>

            <form onSubmit={handleSubmit} className="details-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age <span className="required">*</span></label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Your age"
                    min="1" max="100"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender <span className="required">*</span></label>
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>State <span className="required">*</span></label>
                  <select name="state" value={form.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Social Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Occupation <span className="required">*</span></label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} required>
                    <option value="" disabled hidden>Select Occupation</option>
                    <option value="student">Student</option>
                    <option value="farmer">Farmer</option>
                    <option value="employed">Employed (Salaried)</option>
                    <option value="self_employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Annual Household Income (₹)</label>
                  <select name="annual_income" value={form.annual_income} onChange={handleChange}>
                    <option value="">Select Income Range</option>
                    <option value="50000">Below ₹50,000</option>
                    <option value="100000">₹50,000 – ₹1 Lakh</option>
                    <option value="300000">₹1 Lakh – ₹3 Lakh</option>
                    <option value="500000">₹3 Lakh – ₹5 Lakh</option>
                    <option value="800000">₹5 Lakh – ₹8 Lakh</option>
                    <option value="1200000">₹8 Lakh – ₹12 Lakh</option>
                    <option value="9999999">Above ₹12 Lakh</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Education <span className="required">*</span></label>
                  <select name="education" value={form.education} onChange={handleChange} required>
                    <option value="" disabled hidden>Select Education</option>
                    <option value="illiterate">Illiterate / No Formal Education</option>
                    <option value="primary">Primary (Up to 5th)</option>
                    <option value="secondary">Secondary (Up to 10th)</option>
                    <option value="higher_secondary">Higher Secondary (12th)</option>
                    <option value="graduate">Graduate</option>
                    <option value="post_graduate">Post Graduate</option>
                    <option value="diploma">Diploma / ITI</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="spinner"></span> Analyzing...</>
                ) : (
                  <>🔍 Find My Schemes</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          {user && (
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <h3>{user.name}</h3>
                  <p>{user.state} • {user.occupation}</p>
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/recommendations')}
              >
                View My Recommendations →
              </button>
            </div>
          )}

          {profiles.length > 0 && (
            <div className="how-it-works" style={{ marginTop: 16 }}>
              <h3>Saved Profiles</h3>
              {profiles.map((p) => (
                <div key={p.user_id} className="step" style={{ alignItems: 'center' }}>
                  <div className="step-num">{p.name?.charAt(0)?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <strong>{p.name}</strong>
                    <p>{p.state} · {p.occupation || 'N/A'} · Age {p.age}</p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ marginRight: 8 }}
                    onClick={() => selectUserProfile(p.user_id)}
                  >
                    Use
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      try {
                        await deleteUserProfile(p.user_id);
                        showToast('Profile deleted', 'info');
                      } catch (err) {
                        showToast('Could not delete profile', 'error');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="categories-grid">
            <h3>Browse by Category</h3>
            <div className="cat-list">
              {[
                { id: 'agriculture', icon: '🌾', label: 'Agriculture' },
                { id: 'education', icon: '🎓', label: 'Education' },
                { id: 'health', icon: '🏥', label: 'Health' },
                { id: 'employment', icon: '💼', label: 'Employment' },
                { id: 'housing', icon: '🏠', label: 'Housing' },
                { id: 'business', icon: '💰', label: 'Business' },
              ].map(c => (
                <a key={c.id} href={`/schemes?category=${c.id}`} className="cat-item">
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Full Width Section */}
      <div className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <strong>Enter Your Details</strong>
                <p>Tell us your age, income, occupation and location</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <strong>AI Recommendation</strong>
                <p>Our system matches your profile with eligible schemes</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <strong>View & Save</strong>
                <p>Read scheme details, save them & apply directly</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div>
                <strong>Stay Updated</strong>
                <p>Get notified when new schemes launch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
