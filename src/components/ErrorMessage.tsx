import React from 'react';

interface ErrorMessageProps {
  message: string;
  children?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, children }) => {
  if (!message) return null;
  return (
    <div style={{ color: '#b00020', background: '#fff0f0', border: '1px solid #b00020', padding: '12px 16px', borderRadius: 4, margin: '12px 0', fontWeight: 500 }}>
      <span role="img" aria-label="Error" style={{ marginRight: 8 }}>❌</span>
      {message}
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
};

export default ErrorMessage; 