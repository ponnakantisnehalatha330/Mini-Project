import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type] || '💬'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
