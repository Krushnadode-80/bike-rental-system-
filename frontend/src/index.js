import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 88, right: 20, zIndex: 10000 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
            padding: '14px 16px',
            fontSize: '14px',
            fontWeight: 600,
            maxWidth: 'min(420px, calc(100vw - 32px))',
          },
          iconTheme: {
            primary: 'var(--brand-orange)',
            secondary: 'var(--bg-card)',
          },
          success: {
            style: { borderLeft: '4px solid var(--brand-green)' },
            iconTheme: { primary: 'var(--brand-green)', secondary: 'var(--bg-card)' },
          },
          error: {
            style: { borderLeft: '4px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' },
          },
          loading: {
            style: { borderLeft: '4px solid var(--brand-orange)' },
          },
        }}
      />
      <App />
    </>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
