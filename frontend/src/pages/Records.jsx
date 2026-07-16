import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RecordUpload from '../components/records/RecordUpload.jsx';
import RecordDetailModal from '../components/records/RecordDetailModal.jsx';
import { addShareSuccess, revokeShareSuccess } from '../store/slices/recordSlice.js';
import {
  FolderLock,
  Plus,
  Search,
  FileText,
  Calendar,
  ShieldAlert,
  Upload,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Link,
  Key,
  Trash2,
  Check,
  Copy,
  MoreVertical,
  RefreshCw,
  Clock,
  Eye,
  FileDown
} from 'lucide-react';

const Records = ({ searchQuery: propSearchQuery }) => {
  const { records, shares } = useSelector(state => state.records);
  const { token, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Sharing states
  const [shareEmail, setShareEmail] = useState('');
  const [shareExpiry, setShareExpiry] = useState('24');
  const [require2FA, setRequire2FA] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [shareError, setShareError] = useState(null);
  const [newShareUrl, setNewShareUrl] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);

  // Success state for link generation
  const [linkSuccess, setLinkSuccess] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  // OCR preview states
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrData, setOcrData] = useState(null);

  const categories = [
    'All',
    'Blood Test',
    'MRI',
    'CT Scan',
    'X-Ray',
    'Vaccination',
    'Prescription'
  ];

  // Combine parent search query and local search query
  const query = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;

  // Exclude Insurance from main Records tab
  const mainRecords = records.filter(record => record.category !== 'Insurance');

  // Filters
  const filteredRecords = mainRecords.filter(record => {
    const matchesCategory = activeCategory === 'All' ||
      record.category.toLowerCase().replace(/\s+/g, '') === activeCategory.toLowerCase().replace(/\s+/g, '');
    const matchesSearch = record.title.toLowerCase().includes(query.toLowerCase()) ||
      (record.description && record.description.toLowerCase().includes(query.toLowerCase())) ||
      (record.provider && record.provider.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Paginated records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRecordSelect = (id) => {
    setSelectedRecordIds(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleGenerateShare = async (e) => {
    e.preventDefault();
    if (selectedRecordIds.length === 0) {
      setShareError('Select at least one record (click table row checkmark)');
      return;
    }

    setShareError(null);
    setNewShareUrl(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sharing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recordIds: selectedRecordIds,
          expiresHours: shareExpiry,
          passcode: require2FA ? Math.floor(1000 + Math.random() * 9000).toString() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create share link');
      }

      const generatedUrl = `${window.location.origin}/share/${data.share.sharingCode}`;
      setNewShareUrl(generatedUrl);
      dispatch(addShareSuccess(data.share));
      setShareEmail('');
      setSelectedRecordIds([]);

      // Trigger temporary checkmark animation success state
      setLinkSuccess(true);
    } catch (err) {
      setShareError(err.message);
    }
  };

  // Hide link success animation after 1.5 seconds
  useEffect(() => {
    if (linkSuccess) {
      const timer = setTimeout(() => setLinkSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [linkSuccess]);

  const handleRevokeShare = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this sharing link? The recipient will instantly lose access.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sharing/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        dispatch(revokeShareSuccess(id));
      }
    } catch (err) {
      console.error('Failed to revoke share link', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedShareId(id);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  // OCR scanning simulator trigger
  const triggerOcrSimulation = () => {
    setOcrScanning(true);
    setOcrProgress(0);
    setOcrData(null);

    const interval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOcrScanning(false);
          setOcrData({
            patient: user?.name || 'A. Rivera',
            date: new Date().toISOString().split('T')[0],
            recordsCount: records.length
          });
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-6 text-slate-805 dark:text-on-surface animate-fade-slide-up">

      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Medical Vault</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
          Manage, inspect, and securely share your medical history and clinical records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Upload, Filters, Table */}
        <div className="lg:col-span-9 space-y-6">

          {/* Bento Upload & OCR grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Upload Zone */}
            <div className="md:col-span-8 hover-lift duration-300">
              <div
                onClick={() => setIsUploadOpen(true)}
                className="bg-white dark:bg-surface-container-low rounded-2xl border-2 border-dashed border-slate-200 dark:border-outline-variant p-8 flex flex-col items-center justify-center text-center transition-all hover:border-accent dark:hover:border-primary-stitch group cursor-pointer shadow-sm hover:shadow"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-primary-container flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-accent dark:text-primary-stitch">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-on-surface text-base mb-1">Upload PDF/Image Record</h3>
                <p className="text-xs text-slate-400 dark:text-on-surface-variant/80 max-w-sm mx-auto mb-6 leading-relaxed">
                  Drag and drop your clinical reports, lab results, or scans here. We support PDF, JPG, and PNG files up to 25MB.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsUploadOpen(true); }}
                    className="px-4 py-2 bg-accent dark:bg-[#bec6e0] text-white dark:text-slate-900 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                    Browse Files
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); triggerOcrSimulation(); }}
                    className="px-4 py-2 border border-slate-250 dark:border-outline-variant text-slate-700 dark:text-on-surface hover:bg-slate-50 dark:hover:bg-surface-container rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    Mobile Scan
                  </button>
                </div>
              </div>
            </div>

            {/* OCR Preview Panel */}
            <div className="md:col-span-4 h-full hover-lift duration-300">
              <div className="bg-white dark:bg-surface-container rounded-2xl p-5 border border-slate-200 dark:border-outline-variant/30 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h4 className="font-bold text-slate-750 dark:text-on-surface flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <RefreshCw className={`h-4 w-4 text-accent dark:text-tertiary ${ocrScanning ? 'animate-spin' : ''}`} />
                    OCR Scanner Core
                  </h4>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${ocrScanning ? 'bg-amber-500/10 text-amber-500 animate-pulse' : ocrData ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-surface-container-high text-slate-400 dark:text-on-surface-variant'
                    }`}>
                    {ocrScanning ? 'Processing' : ocrData ? 'Ready' : 'Idle'}
                  </span>
                </div>

                <div className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-center min-h-[140px]">
                  {ocrScanning ? (
                    <div className="space-y-3">
                      {/* Premium Shimmer Bar loader instead of spinner */}
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-outline-variant/20 rounded-full overflow-hidden relative skeleton-pulse"></div>
                      <div className="w-2/3 h-2 bg-slate-200 dark:bg-outline-variant/20 rounded-full overflow-hidden relative skeleton-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-on-surface-variant/70 text-center animate-pulse">Running ABDM scanner payload...</p>
                    </div>
                  ) : ocrData ? (
                    <div className="space-y-2.5 animate-in zoom-in-95 duration-200 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-tertiary block uppercase">Patient Name</span>
                        <span className="font-bold text-slate-805 dark:text-on-surface">{ocrData.patient}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-tertiary block uppercase">Scanned Date</span>
                        <span className="font-bold text-slate-805 dark:text-on-surface">{ocrData.date}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Status: Verified</span>
                        <span>Reports: {ocrData.recordsCount} total</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 text-slate-500 dark:text-slate-400">
                      <FileText className="h-8 w-8 mx-auto opacity-50 animate-bounce" />
                      <p className="text-[11px] font-semibold leading-relaxed">
                        Upload or simulate scan to view extracted clinical fields.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Filters Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-none stagger-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap uppercase tracking-wider ${activeCategory === cat
                    ? 'bg-slate-900 dark:bg-on-secondary-fixed-variant text-white dark:text-on-secondary-fixed border-transparent dark:border-tertiary/30 shadow-sm'
                    : 'bg-white dark:bg-surface-container border-slate-200 dark:border-outline-variant/30 text-slate-500 dark:text-on-surface-variant hover:border-accent dark:hover:border-primary-stitch'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Records Table Card */}
          <div className="bg-white dark:bg-surface-container rounded-2xl overflow-hidden shadow-sm dark:shadow-soft-ambient border border-slate-200 dark:border-outline-variant/30 stagger-3">
            <div className="overflow-x-auto">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 space-y-3 animate-fade-slide-up">
                  <FolderLock className="h-10 w-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 dark:text-on-surface text-sm">No Health Records Cataloged</h3>
                  <p className="text-xs text-slate-400 dark:text-on-surface-variant max-w-xs mx-auto font-semibold leading-relaxed">
                    Try adjusting your filters, searching another keyword, or click Browse to upload.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-surface-container-high border-b border-slate-200 dark:border-outline-variant/50">
                      <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface">Report Name</th>
                      <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface">Date</th>
                      <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface">Category</th>
                      <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface">Doctor / Provider</th>
                      <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-outline-variant/20">
                    {currentRecords.map((record, index) => {
                      const isSelectedShare = selectedRecordIds.includes(record._id);
                      return (
                        <tr
                          key={record._id}
                          onClick={() => { setSelectedRecord(record); setIsDetailOpen(true); }}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group animate-fade-slide-up"
                          style={{ animationDelay: `${(index + 1) * 40}ms` }}
                        >
                          <td className="px-5 py-3.5 flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelectedShare}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => handleRecordSelect(record._id)}
                              className="rounded border-slate-350 dark:border-outline text-accent dark:text-primary-stitch focus:ring-0 h-4.5 w-4.5 cursor-pointer mr-1"
                              title="Select to Share"
                            />
                            <div className="w-8 h-8 rounded bg-red-500/10 dark:bg-surface-container-highest flex items-center justify-center text-red-500 dark:text-tertiary shrink-0">
                              <FileText className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-805 dark:text-on-surface text-sm truncate max-w-[160px] sm:max-w-[240px]">{record.title}</p>
                              <p className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold">
                                {record.fileName?.slice(-15) || 'document.pdf'}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-505 dark:text-on-surface-variant text-xs font-semibold">{formatDate(record.date)}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-secondary-container/50 text-slate-650 dark:text-secondary-stitch text-[10px] font-bold uppercase tracking-wider border border-slate-200/50 dark:border-secondary-container/30">
                              {record.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-550 dark:text-on-surface text-xs font-bold">{record.provider || 'N/A'}</td>
                          <td className="px-5 py-3.5 text-right shrink-0">
                            <div className="flex gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  if (!selectedRecordIds.includes(record._id)) {
                                    setSelectedRecordIds(prev => [...prev, record._id]);
                                  }
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-primary-stitch/10 text-slate-405 hover:text-accent dark:hover:text-primary-stitch rounded-lg transition-colors"
                                title="Add to Share Locker"
                              >
                                <Link className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => { setSelectedRecord(record); setIsDetailOpen(true); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-450 dark:hover:text-white rounded-lg transition-colors"
                                title="More Info"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 dark:bg-surface-container-lowest border-t border-slate-150 dark:border-outline-variant/30 flex justify-between items-center text-xs text-slate-450 dark:text-on-surface-variant font-bold">
                <p>Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border border-slate-200 dark:border-outline-variant rounded hover:bg-slate-100 dark:hover:bg-surface-variant transition-colors disabled:opacity-40 focus:outline-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border border-slate-200 dark:border-outline-variant rounded hover:bg-slate-100 dark:hover:bg-surface-variant transition-colors disabled:opacity-40 focus:outline-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Secure Share Locker widget with hover-lift */}
        <div className="lg:col-span-3 hover-lift duration-300">
          <div className="bg-white dark:bg-surface-container-high rounded-2xl p-5 border border-slate-200 dark:border-outline-variant shadow-sm space-y-5 relative min-h-[300px]">

            {linkSuccess ? (
              /* Success draw state inside widget after generate link */
              <div className="absolute inset-0 bg-white dark:bg-surface-container-high flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-20">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/20 mb-3">
                  <svg className="w-10 h-10" viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" />
                    <path className="checkmark-kick" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-on-surface text-sm">Link Generated</h4>
                <p className="text-[10px] text-slate-400 dark:text-on-surface-variant font-semibold mt-1">Audit log initialized. Access path mapped.</p>
              </div>
            ) : null}

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-outline-variant/30 pb-3">
              <div className="w-10 h-10 rounded-full bg-accent/15 dark:bg-primary-container flex items-center justify-center text-accent dark:text-primary-stitch">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-on-surface text-sm">Secure Share</h4>
                <p className="text-[10px] text-slate-400 dark:text-on-surface-variant font-semibold">Consent-based Link Locker</p>
              </div>
            </div>

            {shareError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-lg p-2.5 text-[10px] font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {shareError}
              </div>
            )}

            {newShareUrl && !linkSuccess && (
              <div className="bg-teal-550/10 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 text-teal-800 dark:text-teal-400 rounded-xl p-3.5 space-y-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Share Link Generated!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Recipient can securely view your shared records vault.</p>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={newShareUrl}
                    className="bg-white dark:bg-surface-container-low border border-teal-150 dark:border-teal-900/50 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-bold flex-1 select-all focus:outline-none text-teal-800 dark:text-teal-400"
                  />
                  <button
                    onClick={() => copyToClipboard(newShareUrl, 'new')}
                    className="bg-accent dark:bg-primary-stitch text-white dark:text-slate-900 p-2 rounded-lg flex items-center justify-center hover:opacity-95 transition-colors shadow-sm focus:outline-none"
                    title="Copy Share Link"
                  >
                    {copiedShareId === 'new' ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerateShare} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Share access with (Email)
                </label>
                <input
                  type="email"
                  required
                  placeholder="doctor@hospital.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-background border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-on-surface focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-primary-stitch font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 dark:text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Expiration duration
                </label>
                <select
                  value={shareExpiry}
                  onChange={(e) => setShareExpiry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-background border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-slate-655 dark:text-on-surface focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-primary-stitch font-bold cursor-pointer"
                >
                  <option value="1">1 Hour</option>
                  <option value="24">24 Hours</option>
                  <option value="168">7 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-background/50 p-2 rounded-lg border border-slate-150 dark:border-outline-variant/10">
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="rounded border-slate-300 dark:border-outline text-accent dark:text-primary-stitch focus:ring-0 h-4.5 w-4.5 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-bold">Require passcode validation</span>
              </div>

              {selectedRecordIds.length > 0 && (
                <div className="text-[10px] bg-slate-50 dark:bg-surface-container-low p-2 rounded-lg text-slate-500 dark:text-on-surface-variant font-bold uppercase tracking-wider">
                  Selected: {selectedRecordIds.length} records
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-accent dark:bg-tertiary text-white dark:text-slate-900 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all text-xs active:scale-[0.98] focus:outline-none"
              >
                <Link className="h-4.5 w-4.5" />
                Generate Secure Link
              </button>
            </form>

            {/* Active Shares List inside widget */}
            {shares.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-150 dark:border-outline-variant/30">
                <p className="text-[10px] text-slate-400 dark:text-on-surface-variant mb-3 font-bold uppercase tracking-widest">Active Shares</p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {shares.map(share => (
                    <div key={share._id} className="flex items-center justify-between text-[10px] p-2 bg-slate-50 dark:bg-surface-container rounded border border-slate-200/50 dark:border-outline-variant/20 font-bold text-slate-655 dark:text-on-surface">
                      <div className="truncate pr-2">
                        <p className="truncate text-slate-805 dark:text-on-surface">{share.sharingCode.slice(0, 10)}</p>
                        <p className="text-[8px] text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Expires soon</p>
                      </div>
                      <button
                        onClick={() => handleRevokeShare(share._id)}
                        className="text-red-650 dark:text-error hover:underline transition-all font-extrabold shrink-0 focus:outline-none"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Upload Record Modal */}
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

export default Records;
