import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Stethoscope, KeyRound, Lock, Search, AlertCircle, FileText, Download, Calendar, ShieldCheck, Heart } from 'lucide-react';

const DoctorPortal = () => {
  const { user, token: userToken } = useSelector(state => state.auth);

  // States for code input access
  const [sharingCode, setSharingCode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [requirePasscode, setRequirePasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for retrieved patient data
  const [patientProfile, setPatientProfile] = useState(null);
  const [sharedRecords, setSharedRecords] = useState([]);
  const [activeCode, setActiveCode] = useState(null);
  
  // Single active view document state
  const [activeDoc, setActiveDoc] = useState(null);
  const [downloadingDocId, setDownloadingDocId] = useState(null);

  // Success animation states
  const [pinSuccess, setPinSuccess] = useState(false);
  const [cachedData, setCachedData] = useState(null);

  // Check if URL has a sharing code on mount
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const shareIdx = pathParts.indexOf('share');
    if (shareIdx !== -1 && pathParts[shareIdx + 1]) {
      setSharingCode(pathParts[shareIdx + 1]);
    }
  }, []);

  const handleAccess = async (e) => {
    if (e) e.preventDefault();
    if (!sharingCode) {
      setError('Please provide a sharing code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sharing/access/${sharingCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ passcode: passcode || undefined })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Access denied');
      }

      if (data.requirePasscode) {
        setRequirePasscode(true);
        setLoading(false);
        return;
      }

      // Succeeded! Save data locally first and trigger verified success animation
      setCachedData(data);
      setPinSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // mount data after 1 second of checkmark/shield verification animation
  useEffect(() => {
    if (pinSuccess && cachedData) {
      const timer = setTimeout(() => {
        setPatientProfile(cachedData.patient);
        setSharedRecords(cachedData.records);
        setActiveCode(sharingCode);
        setRequirePasscode(false);
        setError(null);
        setPinSuccess(false);
        setCachedData(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pinSuccess, cachedData, sharingCode]);

  const handleDownloadFile = async (record) => {
    setDownloadingDocId(record._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/records/${record._id}/download`, {
        headers: {
          'Authorization': `Bearer ${userToken || localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Verification required. Download is restricted to authorized sessions.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName || 'decrypted_medical_record';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleReset = () => {
    setPatientProfile(null);
    setSharedRecords([]);
    setActiveCode(null);
    setSharingCode('');
    setPasscode('');
    setRequirePasscode(false);
    setActiveDoc(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-on-surface animate-fade-slide-up">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Doctor Access Console</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
          Review patient-shared dossiers using a secure one-time passcode.
        </p>
      </div>

      {/* Code validation login view */}
      {!patientProfile ? (
        <div className="max-w-md mx-auto bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 shadow-xl rounded-2xl p-8 space-y-6 relative overflow-hidden">
          
          {pinSuccess ? (
            /* PIN Passcode Verification Succeeded drawing checkmark screen */
            <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-300 text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/20">
                <svg className="w-12 h-12" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" />
                  <path className="checkmark-kick" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-on-surface">PIN Validated</h3>
              <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold">Decrypting medical vault records. Mount active.</p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-[#2D3748] dark:bg-primary-container rounded-xl flex items-center justify-center text-white dark:text-primary-stitch mx-auto shadow-sm">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-on-surface tracking-tight">Secure Document Access</h3>
                <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 font-medium">Verify sharing credentials to view encrypted clinical records</p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-655 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Quick Demo Help Alert */}
              <div className="bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 p-3.5 rounded-xl text-[11px] font-semibold text-slate-500 dark:text-on-surface-variant/90 space-y-1.5">
                <p className="text-slate-700 dark:text-on-surface font-extrabold">To test sharing access:</p>
                <p>1. Go to <span className="text-accent dark:text-primary-stitch font-bold">Secure Share</span> page, check documents, and generate a link.</p>
                <p>2. Copy the code at the end of the link (e.g. <code className="bg-slate-200 dark:bg-surface-container px-1 py-0.5 rounded text-slate-800 dark:text-on-surface font-mono">demo_code_1</code>).</p>
                <p>3. Input the code here. If passcode PIN was set (demo code PIN is <code className="bg-slate-200 dark:bg-surface-container px-1 py-0.5 rounded text-slate-800 dark:text-on-surface font-mono">1234</code>), verify it.</p>
              </div>

              <form onSubmit={handleAccess} className="space-y-4">
                {!requirePasscode ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider block">Sharing Code</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 dark:text-on-surface-variant">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Enter 32-character key or 'demo_code_1'"
                        value={sharingCode}
                        onChange={(e) => setSharingCode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-805 dark:text-on-surface font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-on-surface">
                      <Lock className="h-4.5 w-4.5 text-accent dark:text-tertiary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Passcode PIN Required</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-on-surface-variant font-semibold">This share connection is PIN protected. Enter the 4-digit code (e.g. 1234):</p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="••••"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full bg-white dark:bg-background border border-slate-200 dark:border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-sm font-extrabold tracking-widest text-center focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition-all text-xs shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying Key...' : 'Validate Access'}
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        /* Patient files browsing view */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Patient Header Summary */}
          <div className="bg-[#1A2535] dark:bg-surface-container border border-[#293548] text-white dark:text-on-surface rounded-2xl p-6 shadow-md flex justify-between items-start">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block">Currently Inspecting Patient</span>
                <h3 className="text-xl font-black leading-tight mt-0.5">{patientProfile.name}</h3>
              </div>

              {/* Bio details grid */}
              <div className="flex flex-wrap gap-4 text-xs font-bold">
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wide">
                  <Heart className="h-4 w-4 fill-red-400 shrink-0" />
                  Blood: {patientProfile.bloodGroup || 'O-'}
                </span>
                <span className="text-slate-300 dark:text-on-surface-variant">Allergies: <span className="text-white dark:text-on-surface">{patientProfile.allergies || 'None'}</span></span>
              </div>
            </div>
            
            <button
              onClick={handleReset}
              className="bg-[#2E3748] dark:bg-surface-container-high hover:bg-red-655/10 hover:text-red-500 text-slate-300 dark:text-on-surface font-bold text-xs px-4 py-2 rounded-lg transition-colors border border-transparent dark:border-outline-variant/30 focus:outline-none"
            >
              Close Console
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Shared Records list Column with hover lift */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4 hover-lift duration-300">
              <h4 className="text-xs font-bold text-slate-750 dark:text-on-surface uppercase tracking-wider border-b border-slate-100 dark:border-outline-variant/20 pb-2 flex items-center justify-between">
                <span>Shared Records Vault</span>
                <span className="bg-accent/10 border border-accent/20 text-accent dark:text-primary-stitch px-2.5 py-0.5 rounded-full text-[10px]">
                  {sharedRecords.length} Files
                </span>
              </h4>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {sharedRecords.map((record, index) => (
                  <div
                    key={record._id}
                    onClick={() => setActiveDoc(record)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      activeDoc?._id === record._id 
                        ? 'border-accent dark:border-primary-stitch bg-accent/5 dark:bg-primary-container/10' 
                        : 'border-slate-200 dark:border-outline-variant/10 bg-slate-50 dark:bg-surface-container-low hover:bg-slate-100/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-slate-200 dark:bg-surface-container text-slate-700 dark:text-on-surface-variant text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-transparent dark:border-outline-variant/10">
                        {record.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(record.date)}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-xs text-slate-800 dark:text-on-surface leading-snug line-clamp-1">{record.title}</h5>
                    <p className="text-[10px] text-slate-400 dark:text-on-surface-variant/80 truncate mt-1">{record.fileName}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Document Details Column with hover lift */}
            <div className="lg:col-span-3 space-y-4 hover-lift duration-300">
              {activeDoc ? (
                <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-outline-variant/20 pb-4">
                    <div>
                      <span className="bg-accent dark:bg-primary text-white dark:text-slate-900 text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                        {activeDoc.category}
                      </span>
                      <h4 className="font-black text-slate-850 dark:text-on-surface text-base leading-snug">{activeDoc.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-on-surface-variant mt-1">Uploaded On: {formatDate(activeDoc.createdAt)}</p>
                    </div>

                    <button
                      onClick={() => handleDownloadFile(activeDoc)}
                      disabled={downloadingDocId === activeDoc._id}
                      className="flex items-center gap-1.5 bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50 active:scale-95"
                    >
                      <Download className="h-4 w-4" />
                      {downloadingDocId === activeDoc._id ? 'Verifying...' : 'Download Record'}
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider">Clinical Notes</span>
                    <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 p-3.5 rounded-lg">
                      {activeDoc.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* OCR Scanned text details */}
                  {activeDoc.ocrText && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider">Scanned Text Data (OCR)</span>
                      <pre className="text-[11px] font-mono text-slate-705 dark:text-slate-300 bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 p-4.5 rounded-lg leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {activeDoc.ocrText}
                      </pre>
                    </div>
                  )}

                  {/* AI Interpret Summary details */}
                  {activeDoc.aiExplanation && (
                    <div className="bg-teal-500/5 dark:bg-primary-container/10 border border-accent/25 dark:border-primary/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4.5 w-4.5 text-accent dark:text-primary-stitch animate-pulse" />
                        <h5 className="font-bold text-xs text-slate-800 dark:text-primary uppercase tracking-wide">AI Lab Report Explanation</h5>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed font-medium">
                        {activeDoc.aiExplanation.split('\n').map((line, idx) => {
                          if (line.startsWith('###')) {
                            return <h6 key={idx} className="font-extrabold text-slate-800 dark:text-on-surface border-b border-slate-100 dark:border-outline-variant/20 pb-0.5 mt-3">{line.replace('###', '')}</h6>;
                          }
                          if (line.startsWith('-')) {
                            return <li key={idx} className="ml-3 list-disc text-[11px]">{line.replace('-', '').trim()}</li>;
                          }
                          return <p key={idx} className="text-[11px]">{line}</p>;
                        })}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-12 text-center shadow-sm h-full flex flex-col justify-center items-center">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-on-surface-variant/40 mb-3" />
                  <h4 className="font-bold text-slate-700 dark:text-on-surface text-sm">No Document Selected</h4>
                  <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 font-medium mt-1 leading-relaxed max-w-xs mx-auto">
                    Select any shared clinical record from the left list to review medical details, OCR logs, and AI explanations.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorPortal;
