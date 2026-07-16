import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  X,
  Upload,
  CheckCircle2,
  Calendar,
  Lock,
  Clock,
  Share2,
  Users,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import ThemeSelector from '../components/layout/ThemeSelector.jsx';

const Landing = ({ onLoginClick, onRegisterClick, currentTheme, onThemeChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  // Interactive Walkthrough Modal State
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // Step 1: Upload simulation state
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle, scanning, complete
  const [ocrLog, setOcrLog] = useState('');
  const [scannedData, setScannedData] = useState(null);

  // Step 3: Consent sharing simulation state
  const [selectedShares, setSelectedShares] = useState({
    records: true,
    allergies: true,
    medications: false,
  });
  const [expiryTime, setExpiryTime] = useState('24 Hours');
  const [pinRequired, setPinRequired] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 80) {
        setShowNavbar(true);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // OCR Simulator
  const handleOcrSimulation = () => {
    setOcrStatus('scanning');
    setOcrProgress(0);
    setOcrLog('Initializing ABDM scanner core...');

    const logs = [
      { p: 15, msg: 'Loading neural language layout engine...' },
      { p: 30, msg: 'Extracting high-resolution text boundaries...' },
      { p: 45, msg: 'Normalizing laboratory metrics (HbA1c, Cholesterol)...' },
      { p: 65, msg: 'Comparing values against clinical reference levels...' },
      { p: 85, msg: 'Signing payload using zero-knowledge client encryption...' },
      { p: 100, msg: 'Document classified and ready for chronological mapping!' }
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setOcrProgress(log.p);
        setOcrLog(log.msg);
        if (log.p === 100) {
          setOcrStatus('complete');
          setScannedData({
            patientName: 'Karan Sharma',
            docType: 'Diagnostic Lab Report',
            date: '20-Jun-2026',
            provider: 'Dr. Lal PathLabs',
            vitals: [
              { name: 'HbA1c (Glycated Hemoglobin)', value: '6.8 %', status: 'High', color: 'text-rose-400' },
              { name: 'Total Cholesterol', value: '185 mg/dL', status: 'Normal', color: 'text-emerald-400' },
              { name: 'Serum Creatinine', value: '0.95 mg/dL', status: 'Normal', color: 'text-emerald-400' }
            ]
          });
        }
      }, log.p * 25);
    });
  };

  const resetOcrSimulation = () => {
    setOcrStatus('idle');
    setOcrProgress(0);
    setOcrLog('');
    setScannedData(null);
  };

  const handleGenerateLink = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedLink(`http://localhost:5173/share/doc-${randomId}`);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const resetDemo = () => {
    setDemoStep(1);
    resetOcrSimulation();
    setGeneratedLink('');
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e4e2e4] selection:bg-[#bec6e0] selection:text-[#283044] overflow-x-hidden font-sans relative">
      {/* Dynamic Style injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, rgba(190, 198, 224, 0.05) 0%, transparent 70%);
        }
        .glass-card {
          background: rgba(31, 31, 33, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(69, 70, 77, 0.4);
        }
        html {
          scroll-behavior: smooth;
        }
      `}} />

      {/* TopNavBar */}
      <header className={`fixed top-0 w-full z-50 bg-[#131315]/80 backdrop-blur-md border-b border-[#45464d] transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="material-symbols-outlined text-[#bec6e0] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
            <span className="text-xl font-bold text-[#bec6e0] tracking-tight">HealthVault</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-[#bec6e0] font-bold border-b-2 border-[#bec6e0] pb-1 text-sm transition-all">Medical Vault</button>
            <button onClick={() => scrollToSection('family-card')} className="text-[#c6c6cd] hover:text-[#bec6e0] transition-colors text-sm">Family</button>
            <button onClick={() => scrollToSection('emergency-card')} className="text-[#c6c6cd] hover:text-[#bec6e0] transition-colors text-sm">Emergency Card</button>
            <button onClick={() => scrollToSection('security')} className="text-[#c6c6cd] hover:text-[#bec6e0] transition-colors text-sm">Security</button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="scale-90">
              <ThemeSelector currentTheme={currentTheme} onChange={onThemeChange} />
            </div>



            <button onClick={onLoginClick} className="text-[#c6c6cd] text-sm hover:text-[#bec6e0] transition-colors font-medium">Log In</button>
            <button onClick={onRegisterClick} className="bg-[#bec6e0] text-[#283044] px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#bec6e0]/10">Sign Up</button>

            {/* Mobile Menu Icon */}
            <button className="md:hidden text-[#c6c6cd] hover:text-[#bec6e0]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="material-symbols-outlined text-[28px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#45464d] bg-[#131315] px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
            <button onClick={() => scrollToSection('features')} className="text-[#bec6e0] text-left font-bold text-sm py-1">Medical Vault</button>
            <button onClick={() => scrollToSection('family-card')} className="text-[#c6c6cd] text-left text-sm py-1">Family Profiles</button>
            <button onClick={() => scrollToSection('emergency-card')} className="text-[#c6c6cd] text-left text-sm py-1">Emergency QR Access</button>
            <button onClick={() => scrollToSection('security')} className="text-[#c6c6cd] text-left text-sm py-1">Security Systems</button>
            <hr className="border-[#45464d]" />

          </div>
        )}
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 hero-gradient">
          <div className="max-w-[1440px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3e495d]/30 border border-[#bcc7de]/20 mb-6">
                <span className="material-symbols-outlined text-[#bcc7de] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#bcc7de]">Built with HIPAA & GDPR Security Principles</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#e4e2e4] mb-6 leading-tight tracking-tight">
                Your Health, <br />
                <span className="text-[#bec6e0] bg-gradient-to-r from-[#bec6e0] to-[#bcc7de] bg-clip-text text-transparent">Securely Centralized.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#c6c6cd] mb-8 max-w-[520px] leading-relaxed">
                The ultimate encrypted digital vault for your medical records. Manage your entire family's health history with professional-grade security and instant emergency access.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={onRegisterClick} className="bg-[#bec6e0] text-[#283044] px-6 py-3 rounded-lg font-bold text-base hover:shadow-lg hover:shadow-[#bec6e0]/20 transition-all active:scale-95 flex items-center gap-2">
                  Start Your Vault
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => setIsDemoOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#45464d] bg-[#1f1f21]/20 hover:bg-[#353436]/50 transition-all font-bold text-base">
                  <Play className="h-4 w-4 fill-current" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative group flex justify-center">
              <div className="absolute -inset-4 bg-[#bec6e0]/10 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity pointer-events-none"></div>
              <img
                alt="HealthVault Secure interface visualization"
                className="relative z-10 w-full max-w-[580px] rounded-2xl shadow-2xl border border-[#45464d] transition-transform duration-500 hover:scale-[1.01]"
                src="/dashboard_screenshot.png"
              />
            </div>
          </div>
        </section>

        {/* Value Proposition (Bento Grid) */}
        <section id="features" className="py-16 max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Clinical Excellence in Record Keeping</h2>
            <p className="text-[#c6c6cd] text-sm sm:text-base max-w-xl mx-auto">Engineered for absolute reliability, security compliance, and instant recall.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Vault */}
            <div
              id="vault-card"
              onClick={onLoginClick}
              className="glass-card p-6 sm:p-8 rounded-xl group hover:border-[#bec6e0]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[250px]"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#bec6e0]/10 flex items-center justify-center mb-6 group-hover:bg-[#bec6e0]/20 transition-all text-[#bec6e0]">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#e4e2e4]">Secure Document Vault</h3>
                <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                  Advanced OCR scanning automatically parses PDFs, images, and lab results, sorting them into a fully searchable, encrypted chronological health timeline.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[#bec6e0] font-bold text-xs group-hover:translate-x-1 transition-transform">
                Open Document Locker <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 2: Family Health */}
            <div
              id="family-card"
              onClick={onLoginClick}
              className="glass-card p-6 sm:p-8 rounded-xl group hover:border-[#dec29a]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[250px]"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#dec29a]/10 flex items-center justify-center mb-6 group-hover:bg-[#dec29a]/20 transition-all text-[#dec29a]">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>family_restroom</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#e4e2e4]">Family Health Profiles</h3>
                <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                  Manage dependent profiles for children, spouse, or elderly parents from a unified dashboard. Toggle separate permissions and access logs easily.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[#dec29a] font-bold text-xs group-hover:translate-x-1 transition-transform">
                Configure Family Profiles <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 3: Emergency Card */}
            <div
              id="emergency-card"
              onClick={onLoginClick}
              className="glass-card p-6 sm:p-8 rounded-xl group hover:border-[#bcc7de]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[250px]"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#bcc7de]/10 flex items-center justify-center mb-6 group-hover:bg-[#bcc7de]/20 transition-all text-[#bcc7de]">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#e4e2e4]">Emergency QR Access</h3>
                <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                  Generate secure emergency digital cards. ER staff or first responders can view life-saving vitals, blood type, and allergies via time-limited QR consent.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[#bcc7de] font-bold text-xs group-hover:translate-x-1 transition-transform">
                Setup Emergency Card <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="bg-[#1b1b1d] py-16 border-y border-[#45464d]/30">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="bg-[#0e0e10] rounded-2xl border border-[#45464d] overflow-hidden flex flex-col lg:flex-row">
              <div className="p-8 sm:p-12 lg:w-1/2 flex flex-col justify-center text-left">
                <span className="text-[#bec6e0] font-mono text-xs uppercase tracking-widest mb-3">FORT-KNOX SECURITY</span>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#e4e2e4] leading-tight">
                  Encrypted, secure, and always under your control.
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#bec6e0] mt-1 text-[24px]">vpn_key</span>
                    <div>
                      <h4 className="font-bold text-base text-[#e4e2e4]">End-to-End Encryption</h4>
                      <p className="text-[#c6c6cd] text-sm mt-1 leading-relaxed">
                        Your medical records are encrypted on your device before they're uploaded. Only you and the people you authorize can access them.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#bec6e0] mt-1 text-[24px]">gavel</span>
                    <div>
                      <h4 className="font-bold text-base text-[#e4e2e4]">🛡️ Privacy-First Architecture</h4>
                      <p className="text-[#c6c6cd] text-sm mt-1 leading-relaxed">
                        Built with modern security standards to safeguard your sensitive health information from unauthorized access.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#bec6e0] mt-1 text-[24px]">phonelink_lock</span>
                    <div>
                      <h4 className="font-bold text-base text-[#e4e2e4]">Advanced 2FA Protection</h4>
                      <p className="text-[#c6c6cd] text-sm mt-1 leading-relaxed">
                        Secure authorization gates via hardware keys, TOTP authenticator apps, or device-native biometric passkeys.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 relative bg-[#1f1f21] min-h-[350px] flex items-center justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-[#45464d] p-6 sm:p-12">
                <div className="absolute inset-0 opacity-15">
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#bec6e0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                </div>
                <img
                  alt="Secure Sharing Locker"
                  className="relative z-10 w-full rounded-xl shadow-2xl border border-[#45464d] transition-transform duration-500 hover:scale-[1.01]"
                  src="/doctor_sharing.png"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 max-w-[1440px] mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 tracking-tight">Simple. Seamless. Secure.</h2>
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 relative">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-[1px] bg-[#45464d] -z-10"></div>

            <div className="flex flex-col items-center text-center max-w-[320px] mx-auto bg-[#131315] px-4">
              <div className="w-20 h-20 rounded-full bg-[#1f1f21] border border-[#bec6e0] flex items-center justify-center mb-6 shadow-lg shadow-[#bec6e0]/5">
                <span className="material-symbols-outlined text-[#bec6e0] text-[36px]">cloud_upload</span>
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#e4e2e4]">1. Upload</h4>
              <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                Scan or drag-and-drop any medical report. Our OCR parses values and categorizes metadata immediately.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[320px] mx-auto bg-[#131315] px-4">
              <div className="w-20 h-20 rounded-full bg-[#1f1f21] border border-[#bec6e0] flex items-center justify-center mb-6 shadow-lg shadow-[#bec6e0]/5">
                <span className="material-symbols-outlined text-[#bec6e0] text-[36px]">dashboard_customize</span>
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#e4e2e4]">2. Organize</h4>
              <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                Files plot automatically into a interactive timeline, segmented by diagnostic metrics and practitioner fields.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[320px] mx-auto bg-[#131315] px-4">
              <div className="w-20 h-20 rounded-full bg-[#1f1f21] border border-[#bec6e0] flex items-center justify-center mb-6 shadow-lg shadow-[#bec6e0]/5">
                <span className="material-symbols-outlined text-[#bec6e0] text-[36px]">share</span>
              </div>
              <h4 className="text-lg font-bold mb-2 text-[#e4e2e4]">3. Share</h4>
              <p className="text-[#c6c6cd] text-xs sm:text-sm leading-relaxed">
                Send secure, passcode-locked, time-limited consultation links to clinical specialists. Revoke anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-t border-[#45464d]/30 bg-[#131315]">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 hover:opacity-60 transition-opacity duration-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c6c6cd]">health_and_safety</span>
                <span className="font-bold text-[#c6c6cd] text-lg">MedSecure AI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c6c6cd]">clinical_notes</span>
                <span className="font-bold text-[#c6c6cd] text-lg">GlobalHealth</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c6c6cd]">security</span>
                <span className="font-bold text-[#c6c6cd] text-lg">PrivacyWatch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c6c6cd]">verified</span>
                <span className="font-bold text-[#c6c6cd] text-lg">CyberCert</span>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="glass-card max-w-2xl mx-auto p-6 sm:p-8 rounded-xl italic text-[#c6c6cd] text-sm leading-relaxed relative">
                <span className="absolute -top-3 left-6 text-6xl text-[#bec6e0]/10 font-serif">“</span>
                "HealthVault has completely transformed how I manage my aging parents' care. Having everything in one place, instantly accessible during hospital visits, is a literal life-saver."
                <div className="not-italic font-bold text-[#e4e2e4] mt-4 text-xs tracking-wider uppercase">— Dr. Sarah Chen, Chief Medical Officer</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center bg-[#0f172a] relative overflow-hidden border-t border-[#45464d]/30">
          <div className="absolute inset-0 hero-gradient opacity-30 pointer-events-none"></div>
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#e4e2e4]">Take Control of Your Medical History Today.</h2>
            <p className="text-[#c6c6cd] text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Join over 250,000 families protecting their medical future. Create your free vault in under 2 minutes.
            </p>
            <button onClick={onRegisterClick} className="bg-[#bec6e0] text-[#283044] px-8 py-3.5 rounded-lg font-bold text-base hover:shadow-xl hover:shadow-[#bec6e0]/30 transition-all active:scale-95 shadow-lg">
              Start Your Secure Vault
            </button>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-[#c6c6cd] text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> No credit card required</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> HIPAA-grade encryption</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0e0e10] border-t border-[#45464d] py-12">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bec6e0] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
              <span className="text-lg font-bold text-[#bec6e0]">HealthVault</span>
            </div>
            <p className="text-xs text-[#c6c6cd] text-center md:text-left">© 2026 HealthVault Secure Systems. All rights reserved. Built with HIPAA & GDPR Security Principles.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#c6c6cd]">
            <a className="hover:text-[#bec6e0] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#bec6e0] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#bec6e0] transition-colors" href="#">Security Whitepaper</a>
            <a className="hover:text-[#bec6e0] transition-colors" href="#">Contact Support</a>
          </div>

          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full border border-[#45464d] flex items-center justify-center hover:bg-[#1f1f21] text-[#c6c6cd] hover:text-[#bec6e0] transition-colors" href="#" aria-label="Website">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a className="w-10 h-10 rounded-full border border-[#45464d] flex items-center justify-center hover:bg-[#1f1f21] text-[#c6c6cd] hover:text-[#bec6e0] transition-colors" href="#" aria-label="Email">
              <span className="material-symbols-outlined text-[20px]">alternate_email</span>
            </a>
          </div>
        </div>
      </footer>

      {/* ==================== INTERACTIVE DEMO MODAL ==================== */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1f1f21] border border-[#45464d] rounded-2xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] text-left overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="p-5 border-b border-[#45464d] flex justify-between items-center bg-[#18181a]">
              <div className="flex items-center gap-2">
                <div className="bg-[#bec6e0]/10 p-1.5 rounded-lg text-[#bec6e0]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#e4e2e4]">Interactive Platform Walkthrough</h3>
                  <p className="text-xs text-[#c6c6cd]">Experience the core pipeline of HealthVault</p>
                </div>
              </div>
              <button
                onClick={() => { setIsDemoOpen(false); resetDemo(); }}
                className="p-1.5 rounded-lg hover:bg-[#353436] text-[#c6c6cd] hover:text-[#e4e2e4] transition-colors"
                aria-label="Close Walkthrough"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-4 bg-[#1b1b1d] border-b border-[#45464d] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${demoStep >= 1 ? 'bg-[#bec6e0] text-[#283044]' : 'bg-[#353436] text-[#c6c6cd]'}`}>1</span>
                <span className={`font-semibold ${demoStep === 1 ? 'text-[#bec6e0]' : 'text-[#c6c6cd]'}`}>Extract (OCR)</span>
              </div>
              <div className="h-[1px] flex-1 mx-4 bg-[#45464d]"></div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${demoStep >= 2 ? 'bg-[#bec6e0] text-[#283044]' : 'bg-[#353436] text-[#c6c6cd]'}`}>2</span>
                <span className={`font-semibold ${demoStep === 2 ? 'text-[#bec6e0]' : 'text-[#c6c6cd]'}`}>Timeline Sync</span>
              </div>
              <div className="h-[1px] flex-1 mx-4 bg-[#45464d]"></div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${demoStep >= 3 ? 'bg-[#bec6e0] text-[#283044]' : 'bg-[#353436] text-[#c6c6cd]'}`}>3</span>
                <span className={`font-semibold ${demoStep === 3 ? 'text-[#bec6e0]' : 'text-[#c6c6cd]'}`}>Secure Consent Share</span>
              </div>
            </div>

            {/* Scrollable Step Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#131315]">
              {/* STEP 1: OCR Scan Simulation */}
              {demoStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-sm text-[#c6c6cd]">
                    Drag and drop your medical report to test our automated clinical parsing engine. Click the simulation trigger below to begin.
                  </div>

                  {ocrStatus === 'idle' && (
                    <div
                      onClick={handleOcrSimulation}
                      className="border-2 border-dashed border-[#45464d] hover:border-[#bec6e0] rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:bg-[#1f1f21]/40 transition-all"
                    >
                      <div className="p-4 rounded-full bg-[#1f1f21] text-[#bec6e0] group-hover:scale-115 transition-transform">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="font-bold text-[#e4e2e4]">Select diagnostic report file</div>
                      <div className="text-xs text-[#c6c6cd]">Supports PDF, PNG, JPG (Max 5MB)</div>
                      <button className="mt-2 bg-[#bec6e0] text-[#283044] px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-[#bec6e0]/10">
                        Simulate Report Upload
                      </button>
                    </div>
                  )}

                  {ocrStatus === 'scanning' && (
                    <div className="border border-[#45464d] bg-[#1f1f21] rounded-xl p-8 space-y-6">
                      <div className="flex justify-between text-xs font-mono font-bold text-[#bec6e0]">
                        <span>SCANNING & DECRYPTING PAYLOAD</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-[#131315] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#bec6e0] to-[#bcc7de] transition-all duration-200"
                          style={{ width: `${ocrProgress}%` }}
                        ></div>
                      </div>
                      <div className="p-3 bg-[#0e0e10] border border-[#45464d] rounded-lg font-mono text-xs text-[#c6c6cd] h-12 flex items-center">
                        <span className="animate-pulse mr-2">➜</span> {ocrLog}
                      </div>
                    </div>
                  )}

                  {ocrStatus === 'complete' && scannedData && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Scan Completed Successfully
                        </div>
                        <button
                          onClick={resetOcrSimulation}
                          className="text-xs text-[#c6c6cd] hover:text-[#e4e2e4] flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Re-scan File
                        </button>
                      </div>

                      <div className="border border-[#45464d] bg-[#1f1f21] rounded-xl p-4 sm:p-5 grid gap-4">
                        <div className="grid grid-cols-2 gap-2 text-xs border-b border-[#45464d] pb-3">
                          <div>
                            <span className="text-[#c6c6cd] block">Patient Name</span>
                            <span className="font-bold text-[#e4e2e4]">{scannedData.patientName}</span>
                          </div>
                          <div>
                            <span className="text-[#c6c6cd] block">Report Date</span>
                            <span className="font-bold text-[#e4e2e4]">{scannedData.date}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-[#c6c6cd] block">Laboratory</span>
                            <span className="font-bold text-[#e4e2e4]">{scannedData.provider}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-[#c6c6cd] block">Record Type</span>
                            <span className="font-bold text-[#e4e2e4]">{scannedData.docType}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-[#bec6e0] uppercase mb-2">Extracted Biomarker Targets</div>
                          <div className="space-y-2">
                            {scannedData.vitals.map((vit, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-[#45464d]/30 last:border-0">
                                <span className="font-medium text-[#e4e2e4]">{vit.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-[#e4e2e4]">{vit.value}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-[#131315] border border-[#45464d]/50 ${vit.color}`}>{vit.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Interactive Timeline Visualizer */}
              {demoStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-sm text-[#c6c6cd]">
                    Here is how HealthVault maps your records into a central longitudinal timeline, helping you inspect medical trends instantly.
                  </div>

                  <div className="border border-[#45464d] bg-[#1f1f21] rounded-xl p-5 relative overflow-hidden">
                    <div className="relative pl-6 border-l-2 border-[#bec6e0]/30 space-y-8 py-2">

                      {/* Timeline Item 1 */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#bec6e0] border-4 border-[#1f1f21] flex items-center justify-center"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="text-[10px] text-[#bec6e0] font-mono flex items-center gap-1"><Calendar className="h-3 w-3" /> Today — 20-Jun-2026</span>
                            <h4 className="font-bold text-[#e4e2e4] text-sm mt-0.5">Blood Report Uploaded (OCR)</h4>
                            <p className="text-[#c6c6cd] text-xs">HbA1c levels recorded at 6.8% (Prediabetic range)</p>
                          </div>
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">Needs Attention</span>
                        </div>
                      </div>

                      {/* Timeline Item 2 */}
                      <div className="relative opacity-85">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#bcc7de] border-4 border-[#1f1f21] flex items-center justify-center"></div>
                        <div>
                          <span className="text-[10px] text-[#bcc7de] font-mono flex items-center gap-1"><Calendar className="h-3 w-3" /> 18-Mar-2026</span>
                          <h4 className="font-bold text-[#e4e2e4] text-sm mt-0.5">Cardiology Consultation</h4>
                          <p className="text-[#c6c6cd] text-xs">Dr. Verma, Fortis Hospital. Vital notes: Blood Pressure 124/82 mmHg.</p>
                        </div>
                      </div>

                      {/* Timeline Item 3 */}
                      <div className="relative opacity-65">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#dec29a] border-4 border-[#1f1f21] flex items-center justify-center"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="text-[10px] text-[#dec29a] font-mono flex items-center gap-1"><Calendar className="h-3 w-3" /> 05-Dec-2025</span>
                            <h4 className="font-bold text-[#e4e2e4] text-sm mt-0.5">Pneumococcal Vaccine Dose</h4>
                            <p className="text-[#c6c6cd] text-xs">Primary Immunization, Max Healthcare.</p>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">Immunized</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-[#1f1f21] border border-[#45464d] rounded-lg text-xs text-[#c6c6cd]">
                    <span className="material-symbols-outlined text-[#bec6e0] text-lg">info</span>
                    Each entry holds its decrypted source document link, allowing physical certificate exports for clinical proof.
                  </div>
                </div>
              )}

              {/* STEP 3: Consent sharing simulator */}
              {demoStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="text-sm text-[#c6c6cd]">
                    Configure and generate a time-limited consent link. Consulting doctors can view your health assets securely without registration.
                  </div>

                  <div className="border border-[#45464d] bg-[#1f1f21] rounded-xl p-4 sm:p-5 space-y-4">
                    {/* Share Checkboxes */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#bec6e0] uppercase">Select records to export</label>
                      <div className="grid gap-2">
                        <label className="flex items-center gap-2.5 bg-[#131315] p-3 rounded-lg border border-[#45464d]/60 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={selectedShares.records}
                            onChange={(e) => setSelectedShares({ ...selectedShares, records: e.target.checked })}
                            className="rounded border-[#45464d] text-[#bec6e0] focus:ring-0 bg-[#1f1f21]"
                          />
                          <div>
                            <span className="font-bold text-[#e4e2e4] block">CBC Blood Report (20-Jun-2026)</span>
                            <span className="text-[10px] text-[#c6c6cd]">Contains glucose and lipid markers</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 bg-[#131315] p-3 rounded-lg border border-[#45464d]/60 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={selectedShares.allergies}
                            onChange={(e) => setSelectedShares({ ...selectedShares, allergies: e.target.checked })}
                            className="rounded border-[#45464d] text-[#bec6e0] focus:ring-0 bg-[#1f1f21]"
                          />
                          <div>
                            <span className="font-bold text-[#e4e2e4] block">Allergy Records</span>
                            <span className="text-[10px] text-[#c6c6cd]">Sulfa Drugs, Shellfish (Severe)</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Expiration controls */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-[#bec6e0] uppercase block mb-1.5">Consent Duration</label>
                        <select
                          value={expiryTime}
                          onChange={(e) => setExpiryTime(e.target.value)}
                          className="w-full bg-[#131315] border border-[#45464d] rounded-lg text-xs p-2 text-[#e4e2e4] focus:ring-0"
                        >
                          <option>1 Hour</option>
                          <option>24 Hours</option>
                          <option>7 Days</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#bec6e0] uppercase block mb-1.5">Access Passcode</label>
                        <input
                          type="text"
                          value={sharePassword}
                          onChange={(e) => setSharePassword(e.target.value)}
                          className="w-full bg-[#131315] border border-[#45464d] rounded-lg text-xs p-2 text-[#e4e2e4] focus:ring-0 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateLink}
                      className="w-full bg-[#bec6e0] text-[#283044] font-bold text-xs py-2.5 rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Generate Secured Consultation Link
                    </button>

                    {/* Link display */}
                    {generatedLink && (
                      <div className="bg-[#131315] border border-[#bec6e0]/30 rounded-lg p-3 space-y-2 animate-in zoom-in-95 duration-200">
                        <div className="text-[10px] font-bold text-[#bec6e0] uppercase tracking-wider">SHAREABLE DOCTOR LINK</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="bg-[#1f1f21] border border-[#45464d] text-xs p-2 rounded flex-1 font-mono text-[#e4e2e4] select-all outline-none"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="bg-[#1f1f21] border border-[#45464d] text-slate-400 hover:text-white px-3 py-2 rounded transition-colors flex items-center justify-center shrink-0"
                            title="Copy link"
                          >
                            {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-[#c6c6cd]">This URL expires in <strong className="text-[#bec6e0]">{expiryTime}</strong>. Security passcode: <strong className="text-[#bec6e0]">{sharePassword}</strong>.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-[#45464d] bg-[#18181a] flex justify-between items-center">
              <div>
                {demoStep > 1 && (
                  <button
                    onClick={() => setDemoStep(prev => prev - 1)}
                    className="px-4 py-2 text-xs border border-[#45464d] text-[#c6c6cd] hover:text-[#e4e2e4] bg-[#1f1f21] rounded-lg transition-colors font-bold"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {demoStep < 3 ? (
                  <button
                    onClick={() => {
                      if (demoStep === 1 && ocrStatus !== 'complete') {
                        handleOcrSimulation();
                      } else {
                        setDemoStep(prev => prev + 1);
                      }
                    }}
                    className="bg-[#bec6e0] text-[#283044] px-5 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    {demoStep === 1 && ocrStatus !== 'complete' ? 'Trigger Scan Preview' : 'Next Step'}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDemoOpen(false);
                      resetDemo();
                      onRegisterClick();
                    }}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Register Your Own Vault
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
