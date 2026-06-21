import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { user, notifications, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const nav = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/schemes', label: 'Schemes', icon: '📋' },
    { path: '/saved', label: 'Saved', icon: '🔖' },
  ];

  const handleGetStarted = () => {
    const formSection = document.getElementById('form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">AI</div>
          <div className="logo-text">
            <span className="logo-title">SchemeHub</span>
            <span className="logo-sub">AI-Powered Schemes</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links">
          {nav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="nav-actions">
          {/* Notifications bell */}
          <div className="notif-wrapper">
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              🔔
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>🔔 New Schemes</span>
                  <button onClick={() => setNotifOpen(false)}>✕</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">No new schemes</div>
                ) : (
                  notifications.map(n => (
                    <Link
                      key={n.id}
                      to={`/schemes/${n.id}`}
                      className="notif-item"
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className="notif-name">{n.name}</div>
                      <div className="notif-ministry">{n.ministry}</div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User */}
          {user ? (
            <div className="nav-user">
              <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={() => { logout(); navigate('/'); }}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleGetStarted} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, border: 'none', cursor: 'pointer' }}>
              Get Started
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {nav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
