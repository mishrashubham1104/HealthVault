import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStart, fetchSuccess, fetchFailure } from './store/slices/recordSlice.js';
import { logoutUser } from './store/slices/authSlice.js';
import { Bell, Check, Timer, Clock } from 'lucide-react';

// Layout
import Sidebar from './components/layout/Sidebar.jsx';
import Navbar from './components/layout/Navbar.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Records from './pages/Records.jsx';
import Reminders from './pages/Reminders.jsx';
import Sharing from './pages/Sharing.jsx';
import Family from './pages/Family.jsx';
import Insurance from './pages/Insurance.jsx';
import DoctorPortal from './pages/DoctorPortal.jsx';
import EmergencyProfilePage from './pages/EmergencyProfilePage.jsx';
import Legal from './pages/Legal.jsx';
import Settings from './pages/Settings.jsx';

// Modals
import EmergencyCard from './components/emergency/EmergencyCard.jsx';

function App() {
  const { isAuthenticated, token, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [activePage, setActivePage] = useState(() => {
    const cachedToken = localStorage.getItem('token');
    if (!cachedToken) return 'landing';
    return 'dashboard';
  });
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [legalTab, setLegalTab] = useState('privacy');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Medication Alarm System ---
  const { reminders } = useSelector(state => state.records);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [snoozedAlarms, setSnoozedAlarms] = useState([]);
  const lastTriggeredMap = useRef({}); // { [reminderId]: HH:MM }

  // Sound Synth Ref
  const audioContextRef = useRef(null);
  const audioIntervalRef = useRef(null);

  const startAlarmSound = () => {
    if (audioIntervalRef.current) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    audioContextRef.current = audioCtx;

    audioIntervalRef.current = setInterval(() => {
      try {
        const playBeep = (timeOffset, frequency) => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + timeOffset);

          gain.gain.setValueAtTime(0, audioCtx.currentTime + timeOffset);
          gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + timeOffset + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + timeOffset + 0.35);

          osc.start(audioCtx.currentTime + timeOffset);
          osc.stop(audioCtx.currentTime + timeOffset + 0.4);
        };

        // Pleasant double-tone alert chime
        playBeep(0, 880);    // A5
        playBeep(0.18, 1046.5); // C6
      } catch (e) {
        console.error('Audio synth error', e);
      }
    }, 1500);
  };

  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) { }
      audioContextRef.current = null;
    }
  };

  // Browser Autoplay Restriction Unlocker
  useEffect(() => {
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Check reminders and snoozed alarms every 5 seconds
  useEffect(() => {
    if (!isAuthenticated || !reminders || reminders.length === 0) {
      if (activeAlarms.length > 0) {
        setActiveAlarms([]);
        stopAlarmSound();
      }
      return;
    }

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nowMs = now.getTime();

      let alarmTriggered = false;
      const newAlarms = [...activeAlarms];

      // 1. Check active database reminders
      reminders.forEach((reminder) => {
        if (!reminder.isActive) return;

        // Check if reminder matches current time
        if (reminder.time === currentHHMM) {
          // If not triggered in this minute yet
          if (lastTriggeredMap.current[reminder._id] !== currentHHMM) {
            lastTriggeredMap.current[reminder._id] = currentHHMM;
            if (!newAlarms.some(a => a._id === reminder._id)) {
              newAlarms.push(reminder);
              alarmTriggered = true;
            }
          }
        }
      });

      // 2. Check active snoozed reminders
      const remainingSnoozed = [];
      snoozedAlarms.forEach((snooze) => {
        if (nowMs >= snooze.triggerTime) {
          const exists = reminders.find(r => r._id === snooze.reminder._id && r.isActive);
          if (exists) {
            if (!newAlarms.some(a => a._id === exists._id)) {
              newAlarms.push(exists);
              alarmTriggered = true;
            }
          }
        } else {
          remainingSnoozed.push(snooze);
        }
      });

      if (alarmTriggered) {
        setActiveAlarms(newAlarms);
        setSnoozedAlarms(remainingSnoozed);
        startAlarmSound();
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, user, reminders, activeAlarms, snoozedAlarms]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopAlarmSound();
  }, []);

  const handleTakeMedication = (reminderId) => {
    const updated = activeAlarms.filter(a => a._id !== reminderId);
    setActiveAlarms(updated);
    if (updated.length === 0) {
      stopAlarmSound();
    }
  };

  const handleSnoozeAlarm = (reminder) => {
    const updated = activeAlarms.filter(a => a._id !== reminder._id);
    setActiveAlarms(updated);

    // Snooze for 5 minutes
    const snoozeTime = Date.now() + 5 * 60 * 1000;
    setSnoozedAlarms(prev => [...prev, { reminder, triggerTime: snoozeTime }]);

    if (updated.length === 0) {
      stopAlarmSound();
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for 2 days inactivity on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem('token');
    if (cachedToken) {
      const lastActive = localStorage.getItem('lastActiveTime');
      if (lastActive) {
        const elapsed = Date.now() - Number(lastActive);
        const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
        if (elapsed > TWO_DAYS_MS) {
          dispatch(logoutUser());
          setSessionExpiredMsg("Aapne 2 din tak website open nahi ki hai, kripya dobara login karein.");
          setActivePage('login');
          return;
        }
      }
      // If valid, update lastActiveTime to extend session
      localStorage.setItem('lastActiveTime', Date.now().toString());
    }
  }, [dispatch]);

  // Update last active time when user interacts or changes pages
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('lastActiveTime', Date.now().toString());
    }
  }, [activePage, isAuthenticated]);

  // Sync state data on authentication
  useEffect(() => {
    if (!isAuthenticated) {
      // If we are logged out from an authenticated page, redirect to landing.
      // But if we are on a public page already, don't overwrite it.
      const publicPages = ['landing', 'login', 'register', 'doctor-portal'];
      if (!publicPages.includes(activePage)) {
        setActivePage('landing');
      }
      return;
    }

    setActivePage('dashboard');

    const fetchAllData = async () => {
      dispatch(fetchStart());
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch Records
        const recRes = await fetch(`${import.meta.env.VITE_API_URL}/api/records`, { headers });
        const recData = await recRes.json();
        if (recRes.ok) dispatch(fetchSuccess({ type: 'records', data: recData.records }));

        // 2. Fetch Reminders
        const remRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, { headers });
        const remData = await remRes.json();
        if (remRes.ok) dispatch(fetchSuccess({ type: 'reminders', data: remData.reminders }));

        // 3. Fetch Doctor Visits
        const visRes = await fetch(`${import.meta.env.VITE_API_URL}/api/health/visits`, { headers });
        const visData = await visRes.json();
        if (visRes.ok) dispatch(fetchSuccess({ type: 'visits', data: visData.visits }));

        // 4. Fetch Active Shares
        const shareRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sharing/active`, { headers });
        const shareData = await shareRes.json();
        if (shareRes.ok) dispatch(fetchSuccess({ type: 'shares', data: shareData.shares }));
      } catch (err) {
        dispatch(fetchFailure(err.message));
      }
    };

    fetchAllData();
  }, [isAuthenticated, token, user, dispatch]);

  // Handle anonymous share link navigation
  useEffect(() => {
    const isSharePath = window.location.pathname.startsWith('/share/');
    if (isSharePath && !isAuthenticated) {
      setActivePage('doctor-portal');
    }
  }, [isAuthenticated]);

  const isEmergencyProfilePath = window.location.pathname.startsWith('/emergency-profile/');
  if (isEmergencyProfilePath) {
    return <EmergencyProfilePage />;
  }

  if (!isAuthenticated) {
    if (activePage === 'doctor-portal') {
      return <DoctorPortal />;
    }
    if (activePage === 'login') {
      return (
        <Login
          onRegisterClick={() => {
            setSessionExpiredMsg('');
            setActivePage('register');
          }}
          onBackToLanding={() => {
            setSessionExpiredMsg('');
            setActivePage('landing');
          }}
          sessionExpired={sessionExpiredMsg}
        />
      );
    }
    if (activePage === 'register') {
      return (
        <Register
          onLoginClick={() => setActivePage('login')}
          onBackToLanding={() => setActivePage('landing')}
        />
      );
    }
    // Default page for unauthenticated users is Landing
    return (
      <Landing
        onLoginClick={() => {
          setSessionExpiredMsg('');
          setActivePage('login');
        }}
        onRegisterClick={() => setActivePage('register')}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onMenuClick={() => setIsSidebarOpen(true)} setActivePage={setActivePage} setLegalTab={setLegalTab} searchQuery={searchQuery} />;
      case 'records':
        return <Records searchQuery={searchQuery} />;
      case 'reminders':
        return <Reminders />;
      case 'sharing':
        return <Sharing />;
      case 'family':
        return <Family onEmergencyClick={() => setIsEmergencyOpen(true)} />;
      case 'insurance':
        return <Insurance />;
      case 'doctor-portal':
        return <DoctorPortal />;
      case 'legal':
        return <Legal activeTab={legalTab} setActiveTab={setLegalTab} />;
      case 'settings':
        return <Settings currentTheme={theme} onThemeChange={setTheme} />;
      default:
        return <Dashboard onMenuClick={() => setIsSidebarOpen(true)} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-background min-h-screen">
      {/* Sidebar Navigation */}
      {isAuthenticated && (
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onEmergencyClick={() => setIsEmergencyOpen(true)}
        />
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 ${isAuthenticated ? 'pl-0 md:pl-64' : ''}`}>
        {isAuthenticated && (
          <Navbar
            activePage={activePage}
            onEmergencyClick={() => setIsEmergencyOpen(true)}
            currentTheme={theme}
            onThemeChange={setTheme}
            onMenuClick={() => setIsSidebarOpen(true)}
            onSearchChange={(val) => {
              setSearchQuery(val);
              if (val && activePage !== 'records' && activePage !== 'dashboard') {
                setActivePage('records');
              }
            }}
            searchQuery={searchQuery}
          />
        )}

        {/* Content Body */}
        <main className={`p-4 sm:p-8 flex-1 flex flex-col overflow-y-auto ${!isAuthenticated ? 'max-w-4xl mx-auto w-full' : ''}`}>
          <div key={activePage} className="animate-fade-slide-up flex-1 w-full flex flex-col">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Emergency Profile Modal */}
      {isAuthenticated && (
        <EmergencyCard
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}

      {/* Medication Alarm Alert Modal */}
      {isAuthenticated && activeAlarms.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden transform scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">

            {/* Pulsing alarm rings */}
            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-teal-100/50 animate-pulse-ring absolute"></div>
                <div className="h-16 w-16 rounded-full bg-teal-200/50 animate-pulse-ring absolute" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="h-14 w-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg relative z-10 animate-bell-shake">
                <Bell className="h-7 w-7" />
              </div>
            </div>

            {/* Alarm Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Medication Reminder! 🔔</h2>
              <p className="text-xs font-semibold text-teal-600 mt-1 tracking-wider uppercase">Dawai Lene Ka Samay Ho Gaya Hai</p>
            </div>

            {/* Reminders List inside the modal */}
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {activeAlarms.map((alarm) => (
                <div key={alarm._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-800 text-sm truncate">{alarm.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Dosage: {alarm.dosage}</p>
                    <div className="flex items-center gap-1.5 mt-2 bg-slate-200/50 w-max px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">
                      <Clock className="h-3 w-3" />
                      {alarm.time}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleTakeMedication(alarm._id)}
                      className="flex items-center justify-center gap-1 bg-accent hover:bg-accent-hover text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Take
                    </button>
                    <button
                      onClick={() => handleSnoozeAlarm(alarm)}
                      className="flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-lg transition-all active:scale-95"
                    >
                      <Timer className="h-3.5 w-3.5 text-slate-400" />
                      Snooze
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                Please make sure you take your medication on time as prescribed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
