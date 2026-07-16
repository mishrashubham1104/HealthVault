import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldAlert, Bell, Menu, Shield, Search } from 'lucide-react';
import ThemeSelector from './ThemeSelector.jsx';

const Navbar = ({ activePage, onEmergencyClick, currentTheme, onThemeChange, onMenuClick, onSearchChange, searchQuery }) => {
  const { user } = useSelector(state => state.auth);
  const { activeFamilyMember } = useSelector(state => state.records);

  const pageTitles = {
    dashboard: 'Health Dashboard',
    records: 'Medical Vault',
    reminders: 'Medicine Reminders & Schedule',
    sharing: 'Secure Sharing Locker',
    family: 'Family Management',
    insurance: 'Health Insurance Locker',
    legal: 'Privacy & Security Center'
  };

  return (
    <header className="h-16 bg-white dark:bg-surface-container border-b border-slate-200 dark:border-outline-variant flex items-center justify-between px-4 sm:px-8 shadow-sm dark:shadow-none z-10 sticky top-0 transition-colors">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 mr-4">
        {/* Hamburger Menu Toggle on Mobile */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-on-surface-variant dark:hover:text-on-surface hover:bg-slate-50 dark:hover:bg-surface-container-high rounded-lg transition-colors shrink-0 focus:outline-none"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic page title */}
        <h2 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-on-surface truncate tracking-tight hidden sm:block">
          {pageTitles[activePage] || 'Dashboard'}
        </h2>

        {/* Global Search box in TopNavBar (visible on desktop) */}
        {onSearchChange !== undefined && (
          <div className="relative flex-1 max-w-xs ml-2 sm:ml-4">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-on-surface-variant">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-slate-50 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-full pl-9 pr-4 py-1.5 w-full text-xs text-slate-805 dark:text-on-surface placeholder:text-slate-400 dark:placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-primary-stitch"
            />
          </div>
        )}

        {/* Family Member Indicator Badge */}
        {activeFamilyMember && (
          <span className="bg-accent-light dark:bg-secondary-container/40 text-accent dark:text-primary-stitch text-xs font-semibold px-2.5 py-1 rounded-full border border-accent/20 dark:border-secondary-container/50">
            Viewing: {activeFamilyMember.name} ({activeFamilyMember.relation})
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Encrypted Connection Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-tertiary-container/20 border border-teal-100 dark:border-tertiary/20 text-teal-600 dark:text-tertiary">
          <Shield className="h-3.5 w-3.5 fill-current" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Encrypted Connection</span>
        </div>

        {/* Patient-only items */}
        {user?.role === 'Patient' && activePage !== 'dashboard' && (
          <>
            {/* Emergency Health Card Trigger */}
            <button
              onClick={onEmergencyClick}
              className="hidden lg:flex items-center gap-2 bg-red-500 hover:bg-red-650 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 animate-pulse"
            >
              <ShieldAlert className="h-4 w-4" />
              Emergency Card
            </button>
          </>
        )}



        {/* Theme Selector */}
        <ThemeSelector currentTheme={currentTheme} onChange={onThemeChange} />

        {/* Notifications Mock */}
        <button className="p-2 text-slate-550 hover:text-slate-750 dark:text-on-surface-variant dark:hover:text-on-surface hover:bg-slate-50 dark:hover:bg-surface-container-high rounded-lg transition-colors relative focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent dark:bg-error rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
