import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addReminderSuccess, updateReminderSuccess, deleteReminderSuccess } from '../store/slices/recordSlice.js';
import { Clock, Plus, Trash2, AlertCircle, Sparkles, Bell, BellOff, MoreVertical } from 'lucide-react';

const Reminders = () => {
  const { reminders } = useSelector(state => state.records);
  const { token } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('Daily');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dosage) {
      setError('Please provide title and dosage');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, dosage, time, frequency })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add reminder');
      }

      dispatch(addReminderSuccess(data.reminder));
      setShowForm(false);
      
      // Reset
      setTitle('');
      setDosage('');
      setTime('08:00');
      setFrequency('Daily');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentIsActive) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentIsActive })
      });

      if (res.ok) {
        const data = await res.json();
        const payload = data.reminder || { _id: id, isActive: !currentIsActive };
        const existing = reminders.find(r => r._id === id) || {};
        dispatch(updateReminderSuccess({ ...existing, ...payload }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this medication reminder alarm?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        dispatch(deleteReminderSuccess(id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-805 dark:text-on-surface animate-fade-slide-up">
      
      {/* Title */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-200 dark:border-outline-variant/30">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Medicine Reminders</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
            Stay on track with your medication alarms and daily dosage schedule.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover dark:bg-[#bec6e0] dark:text-[#283044] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-6 shadow-xl animate-in slide-in-from-top duration-200 max-w-lg mx-auto">
          <h4 className="text-xs font-bold text-slate-700 dark:text-on-surface uppercase tracking-wider border-b border-slate-100 dark:border-outline-variant/30 pb-2 mb-4">
            Initialize Dosage Routine
          </h4>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Medication Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin 500mg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-850 dark:text-on-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Dosage Instruction</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 Tablet with meals"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-850 dark:text-on-surface"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Schedule Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-750 dark:text-on-surface cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-700 dark:text-on-surface cursor-pointer"
              >
                <option value="Daily">Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="As Needed">As Needed (PRN)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : 'Set Alarm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alarm list cards */}
      {reminders.length === 0 ? (
        <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
          <Clock className="h-12 w-12 text-slate-350 dark:text-on-surface-variant mx-auto mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-on-surface text-sm">No Active Alarms</h3>
          <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 font-semibold mt-1 leading-relaxed">
            Generate customized reminders for your therapeutic routine. Maintain full adherence by scheduling reminders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((reminder, index) => (
            <div
              key={reminder._id}
              className={`rounded-2xl border p-5 flex flex-col justify-between h-44 shadow-sm hover-lift transition-all relative overflow-hidden bg-white dark:bg-surface-container-high hover:-translate-y-0.5 animate-fade-slide-up ${
                reminder.isActive 
                  ? 'border-slate-200 dark:border-outline-variant/10 border-l-4 border-l-accent dark:border-l-primary-stitch' 
                  : 'border-slate-200 dark:border-outline-variant/10 opacity-70 border-l-4 border-l-slate-400'
              }`}
              style={{ animationDelay: `${(index + 1) * 60}ms` }}
            >
              
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`p-3.5 rounded-xl flex items-center justify-center shrink-0 ${
                    reminder.isActive 
                      ? 'bg-accent/10 dark:bg-primary-container text-accent dark:text-primary-stitch animate-bell-shake' 
                      : 'bg-slate-100 dark:bg-surface-container text-slate-400'
                  }`}>
                    {reminder.isActive ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-on-surface text-sm truncate max-w-[140px]">
                      {reminder.title}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold mt-0.5">{reminder.dosage}</p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleToggleActive(reminder._id, reminder.isActive)}
                    className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${
                      reminder.isActive 
                        ? 'bg-accent dark:bg-primary-stitch justify-end' 
                        : 'bg-slate-200 dark:bg-on-secondary-fixed-variant/50 justify-start'
                    }`}
                    title={reminder.isActive ? 'Mute' : 'Activate'}
                  >
                    <span className="h-4 w-4 bg-white rounded-full shadow-sm"></span>
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder._id)}
                    className="p-1 text-slate-350 hover:text-red-500 rounded-md transition-colors"
                    title="Delete Reminder"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Time display */}
              <div className="border-t border-slate-50 dark:border-outline-variant/10 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider">
                  Frequency: {reminder.frequency}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-on-surface bg-slate-50 dark:bg-surface-container px-2.5 py-1 rounded-lg border border-slate-100 dark:border-outline-variant/10">
                  {reminder.time}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Reminders;
