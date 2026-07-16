import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addShareSuccess, revokeShareSuccess } from '../store/slices/recordSlice.js';
import { Share2, Plus, Copy, Check, Trash2, ShieldAlert, KeyRound, AlertCircle, History } from 'lucide-react';

const Sharing = () => {
  const { records, shares } = useSelector(state => state.records);
  const { token, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [expiresHours, setExpiresHours] = useState('24');
  const [passcode, setPasscode] = useState('');
  const [lastPasscode, setLastPasscode] = useState('');
  const [lastSharedRecords, setLastSharedRecords] = useState([]);
  const [lastExpiry, setLastExpiry] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newShareUrl, setNewShareUrl] = useState(null);
  const [copiedShareId, setCopiedShareId] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleRecordSelect = (id) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const formatExpirationDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const buildShareMessage = () => {
    const patientName = user?.name || 'Patient';
    const pinString = lastPasscode ? lastPasscode : 'None (No PIN passcode set)';
    const recordsString = lastSharedRecords.length > 0 
      ? lastSharedRecords.map(title => `• ${title}`).join('\n')
      : '• General Medical Profile';
    const expiryString = lastExpiry ? formatExpirationDate(lastExpiry) : 'N/A';
    
    const formattedUrl = newShareUrl 
      ? newShareUrl.replace(window.location.origin, 'https://healthvault.app') 
      : '';

    const importantBullets = lastPasscode
      ? `• This link is protected by a PIN.\n• Access is time-limited and will expire on ${expiryString}.\n• Please do not share this link or PIN with others.`
      : `• Access is time-limited and will expire on ${expiryString}.\n• Please do not share this link with others.`;

    return `Hello Doctor,

I have securely shared my medical records with you through HealthVault.

Patient Name: ${patientName}

Secure Access Link:
${formattedUrl}

Access PIN: ${pinString}

Shared Records:
${recordsString}

Important:
${importantBullets}

Thank you,
${patientName}`;
  };

  const handleCopyMessage = () => {
    const msg = buildShareMessage();
    navigator.clipboard.writeText(msg);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCreateShare = async (e) => {
    e.preventDefault();
    if (selectedRecords.length === 0) {
      setError('Please select at least one record to share');
      return;
    }

    setLoading(true);
    setError(null);
    setNewShareUrl(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sharing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recordIds: selectedRecords,
          expiresHours,
          passcode: passcode || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create share link');
      }

      const selectedTitles = records
        .filter(r => selectedRecords.includes(r._id))
        .map(r => r.title);

      const generatedUrl = `${window.location.origin}/share/${data.share.sharingCode}`;
      setNewShareUrl(generatedUrl);
      setLastPasscode(passcode);
      setLastSharedRecords(selectedTitles);
      setLastExpiry(data.share.expiresAt);
      
      dispatch(addShareSuccess(data.share));
      setSelectedRecords([]);
      setPasscode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this sharing link? The doctor will instantly lose access.')) return;
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 text-slate-805 dark:text-on-surface animate-fade-slide-up">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Secure Sharing Locker</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
          Generate temporary encrypted links to share health dossiers with clinical practitioners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Sharing Link Box */}
        <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4 hover-lift duration-300">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-outline-variant/10 pb-3">
            <Share2 className="h-5 w-5 text-accent dark:text-primary-stitch animate-pulse" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">Generate Shared Link</h3>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {newShareUrl && (
            <div className="bg-teal-50 dark:bg-primary-container/20 border border-teal-200 dark:border-primary/20 text-teal-850 dark:text-teal-400 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Link Successfully Generated!</p>
                <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-0.5">Copy this link or share the full report message directly with your doctor.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={newShareUrl}
                  className="bg-white dark:bg-background border border-teal-200 dark:border-teal-900/50 rounded-lg px-3 py-2 text-xs font-mono font-bold flex-1 select-all focus:outline-none text-teal-800 dark:text-teal-400"
                />
                <button
                  onClick={() => copyToClipboard(newShareUrl, 'new')}
                  className="bg-accent dark:bg-primary-stitch text-white dark:text-slate-900 p-2 rounded-lg flex items-center justify-center hover:opacity-95 transition-colors shadow-sm focus:outline-none"
                  title="Copy Link"
                >
                  {copiedShareId === 'new' ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 bg-slate-800 dark:bg-surface-container-highest hover:bg-slate-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all focus:outline-none"
                >
                  {copiedMessage ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedMessage ? 'Copied message' : 'Copy Full Message'}
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(buildShareMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm transition-all focus:outline-none"
                >
                  Share via WhatsApp
                </a>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateShare} className="space-y-4">
            
            {/* Step 1: Select Records */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-wider block mb-1">
                Step 1: Select Records to Share
              </label>
              <div className="border border-slate-200 dark:border-outline-variant/30 rounded-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-outline-variant/10 bg-slate-50 dark:bg-surface-container-low">
                {records.filter(r => r.category !== 'Insurance').length === 0 ? (
                  <p className="p-4 text-xs font-medium text-slate-400 text-center italic">No records available to share</p>
                ) : (
                  records.filter(r => r.category !== 'Insurance').map(record => (
                    <label key={record._id} className="flex items-center gap-3 p-3 hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer text-xs font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record._id)}
                        onChange={() => handleRecordSelect(record._id)}
                        className="rounded border-slate-300 dark:border-outline text-accent dark:text-primary-stitch focus:ring-0 h-4.5 w-4.5 cursor-pointer"
                      />
                      <div className="overflow-hidden">
                        <span className="text-slate-800 dark:text-on-surface font-extrabold block truncate">{record.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase">{record.category} ({formatDate(record.date)})</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Step 2: Settings */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-wider block mb-1">
                  Step 2: Link Expiry
                </label>
                <select
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-700 dark:text-on-surface cursor-pointer"
                >
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="48">48 Hours (2 Days)</option>
                  <option value="168">168 Hours (7 Days)</option>
                </select>
              </div>
            </div>

            {/* PIN Passcode protection */}
            <div className="bg-slate-50 dark:bg-surface-container-low border border-slate-150 dark:border-outline-variant/10 p-4 rounded-xl space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <KeyRound className="h-4 w-4 text-accent dark:text-tertiary" />
                PIN Passcode Protection (Optional)
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="4-digit numeric code, e.g. 1234"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs text-center font-bold tracking-widest focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition-all text-xs shadow-sm disabled:opacity-50 focus:outline-none"
            >
              {loading ? 'Creating...' : 'Create Secure Share Link'}
            </button>
          </form>
        </div>

        {/* Active Shares List & Audit Logs */}
        <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col h-[520px] hover-lift duration-300">
          <div className="flex items-center gap-2 border-b border-slate-105 dark:border-outline-variant/10 pb-3 shrink-0">
            <History className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider">Active Shared Connections</h3>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-outline-variant/10">
            {shares.length === 0 ? (
              <p className="text-center py-12 text-xs font-semibold text-slate-400 italic">No active share links cataloged</p>
            ) : (
              shares.map(share => {
                const shareUrl = `${window.location.origin}/share/${share.sharingCode}`;
                return (
                  <div key={share._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-on-surface block">
                          Share Code: <code className="bg-slate-100 dark:bg-surface-container-low text-slate-700 dark:text-primary-stitch px-1.5 py-0.5 rounded text-[10px] font-mono">{share.sharingCode.slice(0, 8)}</code>
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold block uppercase mt-0.5">
                          Expires: {formatDate(share.expiresAt)}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => copyToClipboard(shareUrl, share._id)}
                          className="p-1.5 border border-slate-200 dark:border-outline-variant/30 hover:bg-slate-50 dark:hover:bg-surface-container-low rounded-lg text-slate-500 transition-colors focus:outline-none"
                          title="Copy Share Link"
                        >
                          {copiedShareId === share._id ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRevokeShare(share._id)}
                          className="p-1.5 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded-lg transition-colors focus:outline-none"
                          title="Revoke Share Link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Access Audit logs inside share item */}
                    {share.accessLogs && share.accessLogs.length > 0 && (
                      <div className="bg-slate-50 dark:bg-surface-container-low border border-slate-150 dark:border-outline-variant/10 rounded-xl p-2.5">
                        <span className="text-[9px] font-bold text-slate-450 dark:text-on-surface-variant uppercase tracking-wide block mb-1">
                          Access Audit Trail
                        </span>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {share.accessLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between text-[10px] text-slate-550 font-semibold border-b border-dashed border-slate-200 dark:border-outline-variant/10 last:border-0 pb-0.5">
                              <span>IP: {log.ip}</span>
                              <span className={log.success ? 'text-teal-600 dark:text-teal-400' : 'text-red-550 dark:text-error'}>
                                {log.success ? 'Verified' : 'Failed PIN'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sharing;
