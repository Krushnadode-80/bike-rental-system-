import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, changeTheme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: 'var(--bg-main)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '2px',
      transition: 'all 0.3s ease'
    }}>
      <button
        onClick={() => changeTheme('white')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: theme === 'white' ? '#f1f5f9' : 'transparent',
          color: theme === 'white' ? '#0f172a' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="White Mode"
      >
        <Sun size={16} />
      </button>

      <button
        onClick={() => changeTheme('black')}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: theme === 'black' ? '#1e293b' : 'transparent',
          color: theme === 'black' ? '#ffffff' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Black Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
