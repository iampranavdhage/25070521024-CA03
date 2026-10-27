import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 24px',
        textAlign: 'center',
        background: 'rgba(16, 16, 28, 0.4)',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c084fc',
          marginBottom: '16px',
        }}
      >
        {Icon ? <Icon size={28} /> : null}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', marginBottom: '20px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-y2k-primary">
          <Plus size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
