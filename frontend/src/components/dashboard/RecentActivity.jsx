import React from 'react';
import { useSelector } from 'react-redux';
import { Stethoscope, FileText, Calendar, PlusCircle } from 'lucide-react';

const RecentActivity = () => {
  const { visits, records } = useSelector(state => state.records);

  // Combine visits and records into a single timeline
  const timelineItems = [
    ...visits.map(v => ({
      id: v._id,
      type: 'visit',
      title: `Visit with ${v.doctorName} (${v.specialty})`,
      subtitle: `Diagnosis: ${v.diagnosis || 'General Checkup'}`,
      date: new Date(v.date),
      icon: Stethoscope,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      details: v.notes
    })),
    ...records.map(r => ({
      id: r._id,
      type: 'record',
      title: `Document Uploaded: ${r.title}`,
      subtitle: `Category: ${r.category} (${r.fileName || 'file'})`,
      date: new Date(r.date),
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      details: r.description
    }))
  ];

  // Sort by date descending
  timelineItems.sort((a, b) => b.date - a.date);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Medical History Timeline</h3>
          <p className="text-xs text-slate-400 font-medium">Consolidated activity of records & doctor consultations</p>
        </div>
        <Calendar className="h-5 w-5 text-slate-400" />
      </div>

      <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8">
        {timelineItems.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm italic">
            No medical history logged yet.
          </div>
        ) : (
          timelineItems.slice(0, 5).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.id || idx} className="relative">
                {/* Timeline node icon */}
                <span className={`absolute -left-10 top-0.5 rounded-full p-1.5 border-2 ${item.color} z-10 shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </span>
                
                {/* Content */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    {formatDate(item.date)}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {item.subtitle}
                  </p>
                  {item.details && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-50 border border-slate-100 p-2 rounded-lg italic">
                      "{item.details}"
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
