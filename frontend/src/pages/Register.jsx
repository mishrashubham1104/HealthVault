import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice.js';
import { User, Mail, KeyRound, AlertCircle, Activity, Home, Heart, ShieldCheck, Plus, Droplet } from 'lucide-react';

const Register = ({ onLoginClick, onBackToLanding }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');

  // Success animation state
  const [successData, setSuccessData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(authStart());

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccessData({ token: data.token, user: data.user });
      setShowSuccess(true);
    } catch (err) {
      dispatch(authFailure(err.message));
    }
  };

  // Redirect after 1.2 seconds of success animation
  useEffect(() => {
    if (showSuccess && successData) {
      const timer = setTimeout(() => {
        dispatch(authSuccess(successData));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, successData, dispatch]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Subtle Floating Medical Background Icons */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Heart className="absolute h-16 w-16 text-accent/10 dark:text-primary-stitch/5 animate-float top-[10%] right-[12%]" />
        <ShieldCheck className="absolute h-20 w-20 text-[#dec29a]/10 dark:text-[#dec29a]/5 animate-float-slow bottom-[25%] right-[10%]" />
        <Plus className="absolute h-14 w-14 text-accent/10 dark:text-primary-stitch/5 animate-float-slower top-[20%] left-[10%]" />
        <Droplet className="absolute h-12 w-12 text-accent/10 dark:text-primary-stitch/5 animate-float bottom-[15%] left-[20%]" />
        <Activity className="absolute h-18 w-18 text-accent/10 dark:text-primary-stitch/5 animate-float-slow bottom-[55%] right-[40%]" />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 shadow-2xl p-6 sm:p-8 space-y-6 rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-350">

        {showSuccess ? (
          /* Animated success state after registration */
          <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-300 text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/20">
              <svg className="w-12 h-12" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" />
                <path className="checkmark-kick" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-on-surface">Account Established</h3>
            <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold">Generating public/private key tunnels. Vault active.</p>
          </div>
        ) : (
          <>
            {/* Branding */}
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-[#2D3748] dark:bg-primary-container rounded-xl flex items-center justify-center text-white dark:text-primary-stitch mx-auto shadow-sm">
                <Activity className="h-7 w-7 text-accent dark:text-primary-stitch" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-on-surface tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold">Join HealthVault to secure your medical history</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-error-container/10 border border-red-200 dark:border-error/25 text-red-650 dark:text-error rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-on-surface-variant">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-on-surface-variant">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-on-surface-variant">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface font-medium"
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E3748] hover:bg-slate-800 dark:bg-[#bec6e0] dark:text-slate-900 hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition-all text-xs shadow-sm disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Create Secure Account'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-105 dark:border-outline-variant/20 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 dark:text-on-surface-variant/80">Already have an account? </span>
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-accent dark:text-primary-stitch font-bold hover:underline"
                >
                  Login
                </button>
              </div>
              <button
                type="button"
                onClick={onBackToLanding}
                className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:text-on-surface-variant dark:hover:text-on-surface font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
