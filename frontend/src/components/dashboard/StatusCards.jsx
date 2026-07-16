import React from 'react';
import { useSelector } from 'react-redux';
import { FileText, Bell, Share2, Heart } from 'lucide-react';

const StatusCards = () => {
  const { records, reminders, shares } = useSelector(state => state.records);
  const { user } = useSelector(state => state.auth);

  // Calculate stats
  const totalRecords = records.length;
  const activeReminders = reminders.filter(r => r.isActive).length;
  const activeShares = shares.filter(s => new Date(s.expiresAt) > new Date()).length;
  
  // Find next reminder
  const getNextReminderText = () => {
    const active = reminders.filter(r => r.isActive);
    if (active.length === 0) return 'No active reminders';
    
    // Sort active reminders by time string (e.g. "07:00", "08:00")
    const sorted = [...active].sort((a, b) => a.time.localeCompare(b.time));
    return `${sorted[0].title} at ${sorted[0].time}`;
  };

  const statCards = [
    {
      title: 'Total Medical Records',
      value: totalRecords,
      subtitle: `${records.filter(r => r.category === 'Blood Test').length} Blood Tests, ${records.filter(r => r.category === 'Prescription').length} Prescriptions`,
      icon: FileText,
      color: 'text-teal-600 bg-teal-50 border-teal-100'
    },
    {
      title: 'Active Reminders',
      value: activeReminders,
      subtitle: getNextReminderText(),
      icon: Bell,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      title: 'Active Share Links',
      value: activeShares,
      subtitle: `${shares.length} links generated total`,
      icon: Share2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Vitals Profile',
      value: user?.bloodGroup || 'O-Negative',
      subtitle: `Allergies: ${user?.allergies || 'Penicillin'}`,
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-soft transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <span className="text-2xl font-black text-slate-800 tracking-tight block">
                  {card.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 border-t border-slate-50 pt-3">
              <p className="text-xs text-slate-500 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusCards;
