import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteRecordSuccess } from '../../store/slices/recordSlice.js';
import {
  X,
  Calendar,
  FileText,
  Brain,
  Search,
  Download,
  Trash2,
  AlertCircle,
  FileDown
} from 'lucide-react';

const RecordDetailModal = ({ record, isOpen, onClose }) => {
  const { token } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('summary'); // summary, ocr, ai
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !record) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/records/${record._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to download decrypted file');
      }

      // Convert response to blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName || 'decrypted_health_record';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this medical record? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/records/${record._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete record');
      }

      dispatch(deleteRecordSuccess(record._id));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="bg-accent/10 border border-accent/25 text-accent text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {record.category}
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(record.date)}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Title Banner */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug">
              {record.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Secure File Key: <code className="bg-slate-200/50 px-1 py-0.5 rounded text-[10px] text-slate-600">aes-256-cbc_encrypted</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? 'Decrypting...' : 'Download File'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
              activeTab === 'summary' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Summary Description
          </button>
          {record.ocrText && (
            <button
              onClick={() => setActiveTab('ocr')}
              className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                activeTab === 'ocr' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              OCR Scanned Text
            </button>
          )}
          {record.aiExplanation && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-3 px-4 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                activeTab === 'ai' ? 'border-accent text-accent' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              AI Health Explanation
            </button>
          )}
        </div>

        {/* Tab content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description & Clinical Notes</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {record.description || 'No notes provided for this record.'}
                </p>
              </div>

              {/* Insurance Details Subcard */}
              {record.category === 'Insurance' && record.insuranceDetails && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5">Locker Insurance Policy Parameters</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Provider</span>
                      <span className="text-slate-800">{record.insuranceDetails.provider}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Policy Number</span>
                      <span className="text-slate-800">{record.insuranceDetails.policyNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Coverage Capacity</span>
                      <span className="text-teal-600 font-extrabold">${record.insuranceDetails.coverageAmount?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Policy Period</span>
                      <span className="text-slate-600 text-xs font-medium">
                        {record.insuranceDetails.startDate ? formatDate(record.insuranceDetails.startDate) : 'N/A'} to{' '}
                        {record.insuranceDetails.endDate ? formatDate(record.insuranceDetails.endDate) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileDown className="h-6 w-6 text-accent" />
                  <div>
                    <h4 className="text-sm font-bold">Secure Access Decryption</h4>
                    <p className="text-xs text-slate-400">Download decrypted file to view complete records</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-accent hover:bg-accent-hover text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {downloading ? 'Processing...' : 'Decrypt'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">OCR Digitized Text Output</h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border">
                  Precision Scanner
                </span>
              </div>
              <pre className="text-xs text-slate-700 font-mono bg-slate-50 border border-slate-150 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                {record.ocrText}
              </pre>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-teal-900/5 border border-accent/20 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-accent animate-pulse" />
                <h4 className="text-sm font-bold text-slate-800">AI Report Explanation & Suggestions</h4>
              </div>
              <div className="text-sm text-slate-700 space-y-4 leading-relaxed font-medium markdown-body">
                {/* Simulated rendering of the markdown explanation */}
                {record.aiExplanation ? (
                  record.aiExplanation.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h5 key={idx} className="font-extrabold text-slate-800 border-b border-teal-900/10 pb-1 mt-4">{line.replace('###', '')}</h5>;
                    }
                    if (line.startsWith('-')) {
                      return <li key={idx} className="ml-4 list-disc text-xs">{line.replace('-', '').trim()}</li>;
                    }
                    if (line.startsWith('**')) {
                      return <p key={idx} className="text-xs font-bold mt-2 text-slate-800">{line.replace(/\*\*/g, '')}</p>;
                    }
                    return <p key={idx} className="text-xs font-medium">{line}</p>;
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No AI interpretation generated.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecordDetailModal;
