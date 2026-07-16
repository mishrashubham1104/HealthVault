import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeSelector = ({ currentTheme, onChange }) => {
  const isDark = currentTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => onChange(isDark ? 'light' : 'dark')}
      className="p-2.5 text-slate-650 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-surface-container-high border border-slate-200 dark:border-outline-variant/30 rounded-xl transition-all duration-200 flex items-center gap-2 text-xs font-extrabold shadow-sm"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="hidden sm:inline uppercase tracking-wider">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-500" />
          <span className="hidden sm:inline uppercase tracking-wider">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeSelector;
