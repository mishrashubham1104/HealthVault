import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RecordUpload from '../components/records/RecordUpload.jsx';
import RecordDetailModal from '../components/records/RecordDetailModal.jsx';
import { ShieldCheck, Plus, ShieldAlert, Calendar, DollarSign, Download, ExternalLink } from 'lucide-react';

// Stats Counter Component
const AnimatedCounter = ({ value, duration = 600, formatter = (val) => val }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    const range = end - start;
    let current = start;
    const steps = 30;
    const stepTime = Math.max(Math.floor(duration / steps), 15);
    const stepIncrement = Math.ceil(range / steps);
    
    let stepCount = 0;
    const timer = setInterval(() => {
      stepCount++;
      current += stepIncrement;
      if (stepCount >= steps || current >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{formatter(count)}</span>;
};

const Insurance = () => {
  const { records } = useSelector(state => state.records);
  const { token } = useSelector(state => state.auth);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter insurance records
  const insuranceRecords = records.filter(r => r.category === 'Insurance');

  // Calculate stats
  const totalCoverage = insuranceRecords.reduce((sum, r) => sum + (r.insuranceDetails?.coverageAmount || 0), 0);
  const activePolicies = insuranceRecords.filter(r => {
    const end = r.insuranceDetails?.endDate;
    return !end || new Date(end) > new Date();
  }).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownload = async (record, e) => {
    e.stopPropagation(); // Avoid opening modal
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/records/${record._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = record.fileName || 'decrypted_policy';
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-slate-805 dark:text-on-surface animate-fade-slide-up">
      
      {/* Insurance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm stagger-1">
          <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Total Coverage Value</span>
          <span className="text-2xl font-black text-slate-800 dark:text-on-surface tracking-tight block flex items-center gap-1">
            <DollarSign className="h-6 w-6 text-teal-500 dark:text-primary-stitch shrink-0 animate-pulse" />
            <AnimatedCounter value={totalCoverage} formatter={(v) => v.toLocaleString()} />
          </span>
          <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 font-semibold mt-1">Sum of all active/stored policies</p>
        </div>

        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm stagger-2">
          <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Active Policies</span>
          <span className="text-2xl font-black text-slate-800 dark:text-on-surface tracking-tight block">
            <AnimatedCounter value={activePolicies} />
          </span>
          <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 font-semibold mt-1">Valid and unexpired policies</p>
        </div>

        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm flex items-center justify-between stagger-3">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Upload Policy</span>
            <p className="text-xs text-slate-505 dark:text-on-surface-variant font-semibold">Add health policy documents</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95"
          >
            Add Policy
          </button>
        </div>
      </div>

      {/* Policies List */}
      {insuranceRecords.length === 0 ? (
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
          <ShieldCheck className="h-12 w-12 text-slate-350 dark:text-on-surface-variant mx-auto mb-4" />
          <h3 className="font-bold text-slate-705 dark:text-on-surface text-sm">Insurance Locker Empty</h3>
          <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold mt-1 leading-relaxed">
            Upload your health insurance policy documents. Keep provider details, policy numbers, and coverage data fully organized.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insuranceRecords.map((record, index) => {
            const details = record.insuranceDetails || {};
            const isExpired = details.endDate && new Date(details.endDate) < new Date();
            return (
              <div
                key={record._id}
                onClick={() => {
                  setSelectedRecord(record);
                  setIsDetailOpen(true);
                }}
                className={`rounded-2xl border p-6 flex flex-col justify-between h-60 shadow-sm hover-lift transition-all duration-200 cursor-pointer relative overflow-hidden bg-white dark:bg-surface-container-high hover:-translate-y-0.5 group animate-fade-slide-up ${
                  isExpired ? 'border-red-200 dark:border-red-900/30' : 'border-slate-200 dark:border-outline-variant/10'
                }`}
                style={{ animationDelay: `${(index + 1) * 60}ms` }}
              >
                {/* Visual Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${isExpired ? 'bg-red-500' : 'bg-accent dark:bg-primary-stitch'}`}></div>

                <div>
                  <div className="flex justify-between items-start pl-3">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase block tracking-wider leading-none mb-1">
                        {details.provider || 'Provider'}
                      </span>
                      <h4 className="font-extrabold text-slate-800 dark:text-on-surface text-sm group-hover:text-accent dark:group-hover:text-primary-stitch transition-colors truncate">
                        {record.title}
                      </h4>
                    </div>
                    
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                      isExpired 
                        ? 'bg-red-50 text-red-655 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                        : 'bg-teal-50 text-teal-650 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20'
                    }`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  {/* Core Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pl-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-on-surface-variant font-bold block uppercase leading-none mb-1">Policy ID</span>
                      <span className="font-bold text-slate-700 dark:text-on-surface font-mono truncate block">
                        {details.policyNumber || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-on-surface-variant font-bold block uppercase leading-none mb-1">Coverage limit</span>
                      <span className="font-black text-teal-600 dark:text-tertiary">
                        $<AnimatedCounter value={details.coverageAmount || 0} formatter={(v) => v.toLocaleString()} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-50 dark:border-outline-variant/10 pt-3 flex justify-between items-center pl-3">
                  <span className="text-[10px] text-slate-405 dark:text-on-surface-variant font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Validity: {formatDate(details.startDate)} - {formatDate(details.endDate)}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => handleDownload(record, e)}
                      className="p-1.5 border border-slate-205 dark:border-outline-variant/30 hover:bg-slate-50 dark:hover:bg-surface-container rounded-lg text-slate-500 dark:text-on-surface-variant transition-colors focus:outline-none"
                      title="Download Decrypted Policy"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1.5 border border-slate-200 dark:border-outline-variant/30 hover:bg-slate-50 dark:hover:bg-surface-container rounded-lg text-slate-500 dark:text-on-surface-variant transition-colors focus:outline-none"
                      title="Open Policy Detail"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Policy Modal */}
      <RecordUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Detail Viewer Modal */}
      <RecordDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRecord(null);
        }}
      />

    </div>
  );
};

export default Insurance;
