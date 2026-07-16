import React from 'react';
import { Shield, FileText, Lock, CheckCircle, Scale, Key, Eye } from 'lucide-react';

const Legal = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Eye },
    { id: 'terms', label: 'Terms of Service', icon: Scale },
    { id: 'security', label: 'Security Standards', icon: Lock }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-5 text-slate-900 pointer-events-none">
          <Shield className="h-48 w-48" />
        </div>
        <div className="p-3 bg-accent-light rounded-xl text-accent shrink-0">
          <Shield className="h-8 w-8" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Privacy & Security Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Understanding how we protect, store, and manage your private medical documentation.
          </p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                Privacy Policy
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Last updated: June 28, 2026</p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
              <p>
                At <strong>HealthVault</strong>, we believe that your medical information belongs solely to you. This Privacy Policy outlines the strict measures and guidelines governing how your clinical and medical data is handled.
              </p>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
                <span className="font-extrabold block uppercase tracking-wider">Zero-Knowledge Architecture</span>
                <p className="font-medium">
                  We use client-side zero-knowledge encryption. This means your files and metadata are encrypted on your local device before being uploaded. We do not hold the decryption keys, and we cannot read or disclose your documents under any circumstances.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">1. Information We Collect</h3>
                <p>
                  We collect only the bare minimum of data necessary to provide our service:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Account Credentials:</strong> Email address, hashed password, and two-factor authentication configuration.</li>
                  <li><strong>Medical Records (Encrypted):</strong> PDF files, lab reports, and doctor prescription images. These are stored as encrypted blobs.</li>
                  <li><strong>Vitals Logs (Encrypted):</strong> Heart rate, blood pressure, and blood sugar measurements entered manually.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">2. Data Sharing and Consent</h3>
                <p>
                  Your medical data is never shared with third parties, advertisers, or insurers without your explicit direct action. When you use the **Secure Share** locker to send a temporary consultation link to your physician, you specify the exact scope, passcode protection, and expiration duration. You can revoke access at any point.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">3. Compliance Standards</h3>
                <p>
                  HealthVault adheres strictly to regional and international data protection laws:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>HIPAA (Health Insurance Portability and Accountability Act):</strong> Complies with clinical-grade safety and privacy guidelines.</li>
                  <li><strong>GDPR (General Data Protection Regulation):</strong> Fully supports the Right to Be Forgotten. Deleting your account immediately purges all encrypted blobs from our cloud databases.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                Terms of Service
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Last updated: June 28, 2026</p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
              <p>
                By creating a HealthVault account, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before accessing the platform.
              </p>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800 space-y-1">
                <span className="font-extrabold block uppercase tracking-wider">Critical Responsibility Warning</span>
                <p className="font-medium">
                  Because HealthVault utilizes end-to-end user-managed encryption, we do not store your recovery codes or master keys. If you lose your account password and recovery key, we cannot recover your data. You are entirely responsible for keeping your credentials safe.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">1. Permitted Platform Use</h3>
                <p>
                  You agree to use this platform only for logging personal medical metrics, uploading genuine clinical reports, and sharing health logs with medical personnel. Uploading malware, automated scrapping, or overloading our servers is strictly prohibited.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">2. Emergency QR Consent Disclaimer</h3>
                <p>
                  The Emergency Card feature generates a QR code to print or carry. By activating this feature, you explicitly agree that emergency responders and medical professionals may view the vitals, blood type, and allergy data you configure, immediately upon scanning the code, to facilitate life-saving intervention.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-sm">3. No Medical Advice</h3>
                <p>
                  The automated AI Wellness reports, OCR biomarkers, and vital summaries provided by HealthVault are meant purely for organization and informational purposes. **They do not constitute clinical diagnoses or professional medical advice.** Always consult a qualified physician for any diagnostic interpretations.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                Security Standards
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Clinical Grade Infrastructure Protection</p>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <Key className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-extrabold text-sm">AES-GCM 256-Bit Encryption</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  All clinical document uploads are encrypted client-side using advanced AES-GCM 256-bit cryptosystems before reaching our databases. This is the cryptographic standard approved by the NSA for top-secret data.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <Lock className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-extrabold text-sm">Key Derivation via PBKDF2</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  User keys are derived from your master password using PBKDF2 with SHA-256 and thousands of salt iterations. This prevents brute-force cloud server compromise attempts.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <CheckCircle className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-extrabold text-sm">Automatic Audit Logging</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Every entry access, download event, share generation, or key update is logged in an immutable database ledger, enabling complete tracing transparency for safety auditing.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#0F172A]">
                  <Shield className="h-5 w-5 text-accent" style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-extrabold text-sm">Two-Factor Gatekeeping</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Secure login layers with support for hardware authentication (WebAuthn/FIDO2) or TOTP application codes (e.g. Google Authenticator) prevent credential takeover.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Compliance Certificate</span>
                <h4 className="text-sm font-extrabold">SOC-2 Type II Certified Hosting</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Our cloud clusters operate entirely within AWS SOC-2 certified datacenters offering 99.999% availability and active DDoS shielding.
                </p>
              </div>
              <Shield className="h-12 w-12 text-slate-700 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legal;
