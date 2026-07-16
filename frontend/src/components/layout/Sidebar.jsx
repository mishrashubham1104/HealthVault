import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice.js';
import {
  LayoutDashboard,
  FolderLock,
  Clock,
  Share2,
  Users,
  ShieldAlert,
  LogOut,
  Stethoscope,
  Activity,
  Settings,
  Shield
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, isOpen, setIsOpen, onEmergencyClick }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logoutUser());
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Patient', 'Doctor', 'Admin'] },
    { id: 'records', label: 'Medical Vault', icon: FolderLock, roles: ['Patient', 'Admin'] },
    { id: 'family', label: 'Family Management', icon: Users, roles: ['Patient', 'Admin'] },
    { id: 'reminders', label: 'Med Reminders', icon: Clock, roles: ['Patient', 'Admin'] },
    { id: 'sharing', label: 'Secure Share', icon: Share2, roles: ['Patient', 'Admin'] },
    { id: 'insurance', label: 'Insurance Locker', icon: ShieldAlert, roles: ['Patient', 'Admin'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role || 'Patient'));

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 bg-[#A3B4CA] dark:bg-surface-container-low text-slate-900 dark:text-on-surface h-screen fixed left-0 top-0 flex flex-col justify-between shadow-2xl dark:shadow-sm z-40 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Section */}
          <div className="p-6 border-b border-[#8E9FA9]/40 dark:border-outline-variant/30 flex items-center gap-3">
            <div className="bg-[#2D3748] dark:bg-surface-container p-2 rounded-lg text-white dark:text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight tracking-wide text-[#1A2535] dark:text-on-surface">HealthVault</h1>
              <span className="text-xs text-slate-700 dark:text-on-surface-variant/70 font-bold uppercase tracking-wider -mt-1 block">Secure Records</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 px-4 space-y-1 flex-grow overflow-y-auto scrollbar-none">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-extrabold transition-all duration-150 animate-fade-slide-up ${isActive
                      ? 'bg-slate-800 dark:bg-surface-container-high text-white dark:text-white border-l-4 border-accent dark:border-primary shadow-md dark:shadow-none'
                      : 'text-[#2D3748] dark:text-on-surface-variant hover:bg-[#8EA1B9] dark:hover:bg-surface-container-high/50 hover:text-slate-950 dark:hover:text-on-surface'
                    }`}
                  style={{ animationDelay: `${(index + 1) * 30}ms` }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white dark:text-primary' : 'text-[#475569] dark:text-on-surface-variant/80'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-[#8E9FA9]/40 dark:border-outline-variant/30 shrink-0">

          {/* Emergency Card Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onEmergencyClick) onEmergencyClick();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E5C282] dark:bg-accent hover:bg-[#D4B16F] dark:hover:brightness-110 text-black dark:text-black border border-transparent rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 mb-4 shadow-md active:scale-95"
          >
            <ShieldAlert className="h-4 w-4" />
            Emergency Card
          </button>

          {/* User Details info */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-[#2E3748] dark:bg-surface-container flex items-center justify-center font-bold text-[#E5C282] dark:text-primary border border-[#2E3748]/10 dark:border-outline-variant overflow-hidden text-lg">
              {user?.photo === 'avatar1' ? '🩺' :
               user?.photo === 'avatar2' ? '❤️' :
               user?.photo === 'avatar3' ? '🧑‍⚕️' :
               user?.photo === 'avatar4' ? '🛡️' :
               user?.photo === 'avatar5' ? '👤' :
               user?.photo === 'avatar6' ? '⚡' :
               (user?.name?.slice(0, 2).toUpperCase() || 'JD')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-[#1A2535] dark:text-on-surface">{user?.name || 'User Name'}</p>
              <p className="text-xs text-slate-700 dark:text-on-surface-variant font-bold truncate">ID: {user?._id?.slice(-6) || '8821-X'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActivePage('settings')}
              className="w-full flex items-center gap-3 px-4 py-2 text-[#2D3748] dark:text-on-surface-variant hover:text-slate-950 dark:hover:text-primary text-xs font-extrabold transition-all"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#8EA1B9]/50 dark:bg-surface-container-highest/30 hover:bg-red-600/20 dark:hover:bg-red-950/30 text-[#2D3748] dark:text-on-surface-variant hover:text-red-700 dark:hover:text-error border border-transparent rounded-lg text-sm font-extrabold transition-all duration-150 focus:outline-none"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
