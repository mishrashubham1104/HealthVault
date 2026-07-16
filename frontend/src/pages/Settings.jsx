import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfileSuccess, logoutUser } from '../store/slices/authSlice.js';
import { Check, Copy, AlertCircle } from 'lucide-react';

const Settings = ({ currentTheme, onThemeChange }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { records, reminders, visits, shares } = useSelector(state => state.records);

  // Active modal state: null or 'profile' | 'privacy' | 'security' | 'contact-method' | 'delete-account' | 'categorization' | 'sharing-defaults' | 'upload-quality' | 'auto-category' | 'faq' | 'support' | 'privacy-policy'
  const [activeModal, setActiveModal] = useState(null);

  // --- HIPAA Enforcement Toggle ---
  const [hipaaEnforced, setHipaaEnforced] = useState(() => {
    return localStorage.getItem('pref_hipaa_enforced') !== 'false';
  });

  // --- Notification Toggles ---
  const [notifyAppointments, setNotifyAppointments] = useState(() => {
    return localStorage.getItem('pref_notify_appointments') !== 'false';
  });
  const [notifyReminders, setNotifyReminders] = useState(() => {
    return localStorage.getItem('pref_notify_reminders') !== 'false';
  });
  const [notifySecurity, setNotifySecurity] = useState(() => {
    return localStorage.getItem('pref_notify_security') !== 'false';
  });

  // --- Storage Preferences ---
  const [uploadQuality, setUploadQuality] = useState(() => {
    return localStorage.getItem('pref_upload_quality') || 'Lossless (Medical Grade)';
  });
  const [autoCategorization, setAutoCategorization] = useState(() => {
    return localStorage.getItem('pref_auto_categorization') !== 'false';
  });

  // --- Category Defaults ---
  const [defaultCategory, setDefaultCategory] = useState(() => {
    return localStorage.getItem('pref_default_category') || 'Lab Reports';
  });

  // --- Sharing Defaults ---
  const [sharingAccessLevel, setSharingAccessLevel] = useState(() => {
    return localStorage.getItem('pref_sharing_access') || 'Read-Only';
  });

  // --- Profile Visibility (Privacy) ---
  const [profileVisibility, setProfileVisibility] = useState(() => {
    return localStorage.getItem('pref_profile_visibility') || 'Private';
  });
  const [activityStatus, setActivityStatus] = useState(() => {
    return localStorage.getItem('pref_activity_status') !== 'false';
  });

  // --- Profile Edit Form States ---
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.emergencyContact?.phone || '');
  const [age, setAge] = useState(user?.age || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState(user?.allergies || 'None');
  const [photo, setPhoto] = useState(user?.photo || 'avatar5');
  const [medicalConditionsInput, setMedicalConditionsInput] = useState(
    user?.medicalConditions ? user.medicalConditions.join(', ') : ''
  );
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || '');

  // --- Password Change Form States ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // --- Two-Factor Authentication (2FA) States ---
  const [tfaSuccess, setTfaSuccess] = useState('');
  const [tfaError, setTfaError] = useState('');
  const [tfaLoading, setTfaLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [tfaSetupMode, setTfaSetupMode] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // --- Contact Method Form States ---
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.emergencyContact?.phone || '');
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // --- FAQ Accordion State ---
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // --- Support Form States ---
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');

  // --- Delete Confirmation State ---
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- Feedback Notification States ---
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Load user data on change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.emergencyContact?.phone || '');
      setAge(user.age || '');
      setBloodGroup(user.bloodGroup || 'O+');
      setAllergies(user.allergies || 'None');
      setPhoto(user.photo || 'avatar5');
      setMedicalConditionsInput(user.medicalConditions ? user.medicalConditions.join(', ') : '');
      setEmergencyName(user.emergencyContact?.name || '');
      setEmergencyRelation(user.emergencyContact?.relation || '');
    }
  }, [user]);

  // Sync preference toggles to localStorage
  useEffect(() => {
    localStorage.setItem('pref_hipaa_enforced', String(hipaaEnforced));
  }, [hipaaEnforced]);

  useEffect(() => {
    localStorage.setItem('pref_notify_appointments', String(notifyAppointments));
  }, [notifyAppointments]);

  useEffect(() => {
    localStorage.setItem('pref_notify_reminders', String(notifyReminders));
  }, [notifyReminders]);

  useEffect(() => {
    localStorage.setItem('pref_notify_security', String(notifySecurity));
  }, [notifySecurity]);

  // --- Profile Submission ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    const conditionsArray = medicalConditionsInput
      ? medicalConditionsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const profileData = {
      name,
      age: age ? parseInt(age, 10) : undefined,
      bloodGroup,
      allergies,
      photo,
      medicalConditions: conditionsArray,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      dispatch(updateUserProfileSuccess(data.user));
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => {
        setProfileSuccess('');
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      setProfileError(err.message || 'An error occurred.');
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Password Change Submission ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSecuritySuccess('');
    setSecurityError('');

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecurityLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Password update failed');
      }

      setSecuritySuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSecuritySuccess('');
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      setSecurityError(err.message || 'An error occurred.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // --- Two-Factor Authentication Setup ---
  const handleSetup2FA = async () => {
    setTfaError('');
    setTfaSuccess('');
    setTfaLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed setup');

      setQrCodeUrl(data.qrCode);
      setTfaSecret(data.secret);
      setTfaSetupMode(true);
    } catch (err) {
      setTfaError(err.message || 'Setup error.');
    } finally {
      setTfaLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTfaError('');
    setTfaSuccess('');
    setTfaLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: tfaCode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Code invalid');

      dispatch(updateUserProfileSuccess({ ...user, twoFactorEnabled: true }));
      setTfaSuccess('2FA enabled successfully!');
      setTfaSetupMode(false);
      setQrCodeUrl('');
      setTfaSecret('');
      setTfaCode('');
      setTimeout(() => setTfaSuccess(''), 3000);
    } catch (err) {
      setTfaError(err.message || 'Verification error.');
    } finally {
      setTfaLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable Two-Factor Authentication? Your account security will be reduced.')) return;
    setTfaError('');
    setTfaSuccess('');
    setTfaLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Disable error');

      dispatch(updateUserProfileSuccess({ ...user, twoFactorEnabled: false }));
      setTfaSuccess('2FA disabled successfully.');
      setTimeout(() => setTfaSuccess(''), 3000);
    } catch (err) {
      setTfaError(err.message || 'Disable error.');
    } finally {
      setTfaLoading(false);
    }
  };

  // --- Change Email & Number ---
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSuccess('');
    setContactError('');
    setContactLoading(true);

    try {
      // Mock update to backend profile or config
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name, // Keep existing name
          emergencyContact: {
            ...user.emergencyContact,
            phone: newPhone
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Contact update failed');

      // Note: Backend profile does not support email changes, so email update is local/simulated
      const updatedUser = { ...data.user, email: newEmail };
      dispatch(updateUserProfileSuccess(updatedUser));

      setContactSuccess('Contact methods updated successfully.');
      setTimeout(() => {
        setContactSuccess('');
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      setContactError(err.message || 'An error occurred.');
    } finally {
      setContactLoading(false);
    }
  };

  // --- Export Data Handler ---
  const handleExportData = () => {
    const exportObject = {
      exportedAt: new Date().toISOString(),
      app: 'HealthVault',
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        emergencyContact: user.emergencyContact,
        familyMembers: user.familyMembers
      },
      medicalData: { records, reminders, visits, shares }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `health_vault_export_${user.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // --- Delete Account ---
  const handleDeleteAccountSubmit = () => {
    if (deleteConfirmText !== 'DELETE') {
      alert("Please type 'DELETE' to confirm.");
      return;
    }
    alert("Simulated Account Deletion: All secure cloud nodes decoupled. Logging out...");
    dispatch(logoutUser());
  };

  // --- Privacy Policy & FAQ Content ---
  const faqData = [
    { q: "Is my medical data encrypted?", a: "Yes. All records uploaded to HealthVault are encrypted in transit using SSL/TLS and encrypted at rest with AES-256 standards. Our systems comply with standard cybersecurity best practices." },
    { q: "How does the emergency card QR code work?", a: "Your emergency card QR code redirects to a public profile containing details you specify: blood group, allergies, conditions, and emergency contact. Only this designated data is visible without login." },
    { q: "Can I share files with my doctor?", a: "Yes. You can generate sharing links with expiry dates, pin numbers, and access restrictions to share lab reports or imaging securely." },
    { q: "Is HealthVault HIPAA compliant?", a: "HealthVault incorporates HIPAA security policies including detailed audit logging, automatic logouts, compliance options, and strict encryption limits." }
  ];

  // --- Preset Emojis ---
  const PRESET_EMOJIS = {
    avatar1: '🩺',
    avatar2: '❤️',
    avatar3: '🧑‍⚕️',
    avatar4: '🛡️',
    avatar5: '👤',
    avatar6: '⚡'
  };

  const currentAvatarEmoji = PRESET_EMOJIS[user?.photo] || PRESET_EMOJIS['avatar5'];

  return (
    <div className="pt-6 pb-12 px-4 max-w-4xl mx-auto w-full flex-1">
      {/* Header Section */}
      <div className="mb-6 md:mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Settings</h2>
        <p className="text-slate-500 dark:text-on-surface-variant text-sm">Manage your secure health data and account preferences.</p>
      </div>

      {/* Profile Overview Card (WhatsApp style top) */}
      <section 
        onClick={() => setActiveModal('profile')}
        className="bg-slate-100 dark:bg-surface-container rounded-xl p-4 mb-6 flex items-center gap-4 cursor-pointer hover:bg-slate-200/60 dark:hover:bg-surface-container-high transition-all active:scale-[0.99] border border-slate-200/50 dark:border-outline-variant/10 shadow-sm"
      >
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-surface-container-highest border border-slate-300 dark:border-outline-variant flex items-center justify-center text-3xl select-none">
            {currentAvatarEmoji}
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-[#dec29a] dark:bg-tertiary rounded-full border-2 border-slate-100 dark:border-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[10px] text-black font-black" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-on-surface truncate">{user?.name || 'User Name'}</h3>
          <p className="text-xs text-slate-500 dark:text-on-surface-variant truncate">{user?.email || 'user@healthvault.io'} • Patient ID: HV-{user?._id?.slice(-4).toUpperCase() || '9022'}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#dec29a] dark:bg-tertiary"></span>
            <span className="text-[10px] font-black uppercase text-[#D4B16F] dark:text-tertiary tracking-wider">Verified Profile</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-400 dark:text-outline">chevron_right</span>
      </section>

      {/* List-Based Settings Grid */}
      <div className="space-y-6">
        
        {/* Category: Account */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest pl-2 mb-2">Account</h4>
          <div className="bg-white dark:bg-surface-container-low rounded-xl overflow-hidden border border-slate-200 dark:border-outline-variant/10 shadow-sm">
            
            {/* Privacy */}
            <div 
              onClick={() => setActiveModal('privacy')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-primary rounded-lg shrink-0">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Privacy</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Profile visibility and activity status</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 dark:bg-outline-variant/20 mx-4"></div>
            
            {/* Security */}
            <div 
              onClick={() => setActiveModal('security')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-primary rounded-lg shrink-0">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Security & 2FA</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Change password and config Two-Factor Authentication</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 dark:bg-outline-variant/20 mx-4"></div>
            
            {/* Change Email/Number */}
            <div 
              onClick={() => setActiveModal('contact-method')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-primary rounded-lg shrink-0">
                <span className="material-symbols-outlined">alternate_email</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Change Email/Number</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Update primary contact methods</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 dark:bg-outline-variant/20 mx-4"></div>
            
            {/* Delete Account */}
            <div 
              onClick={() => setActiveModal('delete-account')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-error-container/20 text-red-600 dark:text-error rounded-lg shrink-0">
                <span className="material-symbols-outlined">delete_forever</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600 dark:text-error">Delete Account</p>
                <p className="text-xs text-red-500/70 dark:text-error/60">Permanently remove your health record</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>

          </div>
        </div>

        {/* Category: Medical Preferences */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest pl-2 mb-2">Medical Preferences</h4>
          <div className="bg-white dark:bg-surface-container-low rounded-xl overflow-hidden border border-slate-200 dark:border-outline-variant/10 shadow-sm">
            
            {/* Default Categorization */}
            <div 
              onClick={() => setActiveModal('categorization')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-secondary rounded-lg shrink-0">
                <span className="material-symbols-outlined">category</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Default Categorization</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Default folder for uploads: <span className="font-bold text-[#D4B16F] dark:text-tertiary">{defaultCategory}</span></p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 dark:bg-outline-variant/20 mx-4"></div>
            
            {/* Sharing Defaults */}
            <div 
              onClick={() => setActiveModal('sharing-defaults')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-secondary rounded-lg shrink-0">
                <span className="material-symbols-outlined">share_reviews</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">Sharing Defaults</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Emergency contact access level: <span className="font-bold text-[#D4B16F] dark:text-tertiary">{sharingAccessLevel}</span></p>
              </div>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 dark:bg-outline-variant/20 mx-4"></div>
            
            {/* HIPAA Enforcement Toggle */}
            <div className="flex items-center p-4 gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-secondary rounded-lg shrink-0">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-on-surface">HIPAA Enforcement</p>
                <p className="text-xs text-slate-500 dark:text-on-surface-variant">Strict compliance auditing for all shares</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={hipaaEnforced} 
                  onChange={(e) => setHipaaEnforced(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
              </label>
            </div>

          </div>
        </div>

        {/* Bento Row: Notifications & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Notifications Panel */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest pl-2 mb-2">Notifications</h4>
            <div className="bg-white dark:bg-surface-container-low rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm p-4 space-y-4">
              
              {/* Appointments */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-800 dark:text-on-surface">
                  <span className="material-symbols-outlined text-slate-700 dark:text-primary text-[20px]">event</span>
                  <span className="text-sm font-medium">Appointments</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifyAppointments} 
                    onChange={(e) => setNotifyAppointments(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-outline-variant rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
                </label>
              </div>

              {/* Reminders */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-800 dark:text-on-surface">
                  <span className="material-symbols-outlined text-slate-700 dark:text-primary text-[20px]">alarm</span>
                  <span className="text-sm font-medium">Reminders</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifyReminders} 
                    onChange={(e) => setNotifyReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-outline-variant rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
                </label>
              </div>

              {/* Security Alerts */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-800 dark:text-on-surface">
                  <span className="material-symbols-outlined text-red-500 dark:text-error text-[20px]">priority_high</span>
                  <span className="text-sm font-medium">Security Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifySecurity} 
                    onChange={(e) => setNotifySecurity(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-outline-variant rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
                </label>
              </div>

            </div>
          </div>

          {/* Storage & Data */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest pl-2 mb-2">Storage & Data</h4>
            <div className="bg-white dark:bg-surface-container-low rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm p-4 space-y-4">
              
              {/* Upload Quality */}
              <div 
                onClick={() => setActiveModal('upload-quality')}
                className="flex items-center justify-between cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 text-slate-800 dark:text-on-surface">
                  <span className="material-symbols-outlined text-slate-700 dark:text-primary text-[20px]">hd</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Upload Quality</span>
                    <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-medium">{uploadQuality}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-outline group-hover:text-[#D4B16F] dark:group-hover:text-primary transition-colors text-sm">tune</span>
              </div>

              {/* Auto-Categorization */}
              <div 
                onClick={() => setActiveModal('auto-category')}
                className="flex items-center justify-between cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2 text-slate-800 dark:text-on-surface">
                  <span className="material-symbols-outlined text-slate-700 dark:text-primary text-[20px]">smart_toy</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Auto-Categorization</span>
                    <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-medium">
                      {autoCategorization ? 'AI Document Sorting Enabled' : 'Disabled (Manual Sorting)'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 dark:text-outline group-hover:text-[#D4B16F] dark:group-hover:text-primary transition-colors text-sm">settings_input_component</span>
              </div>

            </div>
          </div>

        </div>

        {/* System & Help */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest pl-2 mb-2">System & Help</h4>
          <div className="bg-white dark:bg-surface-container-low rounded-xl overflow-hidden border border-slate-200 dark:border-outline-variant/10 shadow-sm divide-y divide-slate-100 dark:divide-outline-variant/10">
            
            {/* FAQ */}
            <div 
              onClick={() => setActiveModal('faq')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-tertiary rounded-lg shrink-0">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-on-surface flex-1">Frequently Asked Questions</span>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>

            {/* Contact Support */}
            <div 
              onClick={() => setActiveModal('support')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-tertiary rounded-lg shrink-0">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-on-surface flex-1">Contact Support</span>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">chevron_right</span>
            </div>

            {/* Privacy Policy */}
            <div 
              onClick={() => setActiveModal('privacy-policy')}
              className="flex items-center p-4 gap-4 hover:bg-slate-50 dark:hover:bg-surface-container-highest transition-colors cursor-pointer list-item-hover"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-tertiary rounded-lg shrink-0">
                <span className="material-symbols-outlined">policy</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-on-surface flex-1">Privacy Policy</span>
              <span className="material-symbols-outlined text-slate-400 dark:text-outline text-sm">open_in_new</span>
            </div>

          </div>
        </div>

        {/* HIPAA Compliant Card */}
        <div className="p-6 bg-slate-50 dark:bg-surface-container-low rounded-2xl border border-dashed border-slate-300 dark:border-outline-variant/30 text-center">
          <span className="material-symbols-outlined text-[#D4B16F] dark:text-tertiary mb-2" style={{ fontSize: '32px' }}>verified_user</span>
          <p className="text-sm font-bold text-slate-950 dark:text-on-surface">HIPAA Compliant System</p>
          <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-1 max-w-sm mx-auto">
            Your health records are encrypted at rest and in transit. Only authorized users can access sensitive documents.
          </p>
          <p className="text-[9px] font-mono text-slate-400 dark:text-outline mt-4 uppercase">Last backup: 14 mins ago • AWS HealthScribe Cluster Alpha</p>
        </div>

      </div>

      {/* ========================================================
          MODAL OVERLAYS (All interactive features)
          ======================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1f1f21] border border-slate-200 dark:border-[#45464d] rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-scale-up text-slate-800 dark:text-[#e4e2e4] max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Close Anchor */}
            <button 
              onClick={() => {
                setActiveModal(null);
                setTfaSetupMode(false);
                setTfaCode('');
                setQrCodeUrl('');
                setTfaSecret('');
                setSecurityError('');
                setSecuritySuccess('');
                setProfileError('');
                setProfileSuccess('');
                setContactError('');
                setContactSuccess('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:text-outline dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            {/* --- MODAL 1: EDIT PROFILE --- */}
            {activeModal === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700 dark:text-[#dec29a]">manage_accounts</span>
                    Edit Profile Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Update details shared on emergency scans.</p>
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Avatar Grid */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1.5">Choose Avatar</label>
                  <div className="flex gap-2.5 overflow-x-auto py-1">
                    {Object.entries(PRESET_EMOJIS).map(([id, emoji]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPhoto(id)}
                        className={`h-11 w-11 rounded-full flex items-center justify-center text-2xl border-2 transition-all shrink-0 ${
                          photo === id 
                            ? 'border-[#D4B16F] dark:border-tertiary bg-slate-100 dark:bg-surface-container-highest scale-105' 
                            : 'border-transparent bg-slate-50 dark:bg-surface-container-low hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#D4B16F] dark:focus:border-tertiary text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#D4B16F] dark:focus:border-tertiary text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Blood Group</label>
                    <select 
                      value={bloodGroup} 
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#D4B16F] dark:focus:border-tertiary text-slate-900 dark:text-white font-bold dark:bg-surface"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg} className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Allergies</label>
                    <input 
                      type="text" 
                      value={allergies} 
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#D4B16F] dark:focus:border-tertiary text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Medical Conditions (comma list)</label>
                  <input 
                    type="text" 
                    value={medicalConditionsInput} 
                    onChange={(e) => setMedicalConditionsInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none focus:border-[#D4B16F] dark:focus:border-tertiary text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-outline-variant/30 pt-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Contact Name</label>
                      <input 
                        type="text" 
                        value={emergencyName} 
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant mb-1">Relation</label>
                      <input 
                        type="text" 
                        value={emergencyRelation} 
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-highest dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="px-4 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {/* --- MODAL 2: PRIVACY --- */}
            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">visibility</span>
                    Privacy Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Control how your clinical profile is visible to other providers.</p>
                </div>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-on-surface-variant mb-1">Profile Visibility State</label>
                    <select 
                      value={profileVisibility}
                      onChange={(e) => {
                        setProfileVisibility(e.target.value);
                        localStorage.setItem('pref_profile_visibility', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm font-bold dark:bg-surface"
                    >
                      <option value="Private" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Private (Access by Approval Only)</option>
                      <option value="Emergency Only" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Emergency Only (Accessible via QR Link)</option>
                      <option value="Restricted" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Restricted (Designated Providers Only)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Broadcast Activity Status</p>
                      <p className="text-[10px] text-slate-500 dark:text-on-surface-variant">Allow sharing nodes to see when you are active.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={activityStatus} 
                        onChange={(e) => {
                          setActivityStatus(e.target.checked);
                          localStorage.setItem('pref_activity_status', String(e.target.checked));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-outline-variant rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 3: SECURITY & 2FA --- */}
            {activeModal === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">security</span>
                    Security & Two-Factor Auth
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Manage secure login parameters and credentials.</p>
                </div>

                {/* Password Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-3.5 border-b border-slate-200 dark:border-outline-variant/30 pb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</h4>
                  
                  {securitySuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-lg text-xs">
                      {securitySuccess}
                    </div>
                  )}
                  {securityError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-400 p-2.5 rounded-lg text-xs">
                      {securityError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Current Password</label>
                    <input 
                      type="password" 
                      required 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">New Password</label>
                      <input 
                        type="password" 
                        required 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Confirm New Password</label>
                      <input 
                        type="password" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={securityLoading}
                    className="px-4 py-1.5 bg-slate-900 dark:bg-surface-highest hover:bg-slate-950 dark:hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    {securityLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                {/* 2FA Form */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Two-Factor Authentication</h4>

                  {tfaSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-lg text-xs">
                      {tfaSuccess}
                    </div>
                  )}
                  {tfaError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-400 p-2.5 rounded-lg text-xs">
                      {tfaError}
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-surface-container-low p-3.5 border border-slate-200 dark:border-outline-variant/30 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        2FA Status: {user?.twoFactorEnabled ? 'Active' : 'Disabled'}
                      </p>
                      <p className="text-[10px] text-slate-500">Requires a 6-digit verification code when logging in.</p>
                    </div>
                    {user?.twoFactorEnabled ? (
                      <button 
                        onClick={handleDisable2FA} 
                        className="px-3 py-1.5 border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg text-xs font-bold"
                      >
                        Disable
                      </button>
                    ) : (
                      !tfaSetupMode && (
                        <button 
                          onClick={handleSetup2FA} 
                          className="px-3 py-1.5 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                        >
                          Setup 2FA
                        </button>
                      )
                    )}
                  </div>

                  {tfaSetupMode && (
                    <div className="border border-slate-200 dark:border-outline-variant rounded-xl p-4 space-y-4 bg-slate-50 dark:bg-surface-container-low animate-fade-slide-up">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {qrCodeUrl && <img src={qrCodeUrl} alt="2FA Scan Code" className="h-28 w-28 p-1 bg-white border rounded" />}
                        <div className="flex-1 space-y-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scan this QR Code with Google Authenticator or Duo app.</p>
                          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-outline-variant rounded flex justify-between items-center font-mono text-[10px]">
                            <span className="truncate pr-2 select-all font-bold">{tfaSecret}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(tfaSecret);
                                setCopiedSecret(true);
                                setTimeout(() => setCopiedSecret(false), 2000);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                              {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <span className="material-symbols-outlined text-sm">content_copy</span>}
                            </button>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleVerify2FA} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter 6-digit OTP" 
                          maxLength="6"
                          value={tfaCode}
                          onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-center font-mono tracking-widest text-slate-900 dark:text-white"
                        />
                        <button 
                          type="submit" 
                          disabled={tfaCode.length !== 6}
                          className="px-4 py-1.5 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- MODAL 4: CHANGE EMAIL/PHONE --- */}
            {activeModal === 'contact-method' && (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">alternate_email</span>
                    Change Contact Methods
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Update primary email address and emergency phone number.</p>
                </div>

                {contactSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-lg text-xs">
                    {contactSuccess}
                  </div>
                )}
                {contactError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-400 p-2.5 rounded-lg text-xs">
                    {contactError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">New Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">New Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-highest dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={contactLoading}
                    className="px-4 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black shadow-sm"
                  >
                    {contactLoading ? 'Saving...' : 'Save Details'}
                  </button>
                </div>
              </form>
            )}

            {/* --- MODAL 5: DELETE ACCOUNT --- */}
            {activeModal === 'delete-account' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-error flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 dark:text-error">delete_forever</span>
                    Delete Account Permanently
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">This action is irreversible and decouples all offline records.</p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-950/40 p-4 rounded-xl space-y-3">
                  <p className="text-xs text-red-800 dark:text-red-400 font-medium">
                    Warning: Once you delete your account, your encrypted backups on the AWS cluster will be shredded. 
                    You must confirm by typing <span className="font-mono font-bold font-black uppercase text-red-700 dark:text-red-300">DELETE</span> below.
                  </p>
                  
                  <input 
                    type="text" 
                    placeholder="Type DELETE to confirm" 
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-1.5 border border-red-300 dark:border-red-950/50 rounded-lg bg-transparent text-sm focus:outline-none text-red-800 dark:text-red-300 font-bold font-mono text-center uppercase"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setActiveModal(null);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-highest dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccountSubmit}
                    disabled={deleteConfirmText !== 'DELETE'}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black disabled:opacity-50 shadow-sm"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 6: DEFAULT CATEGORIZATION --- */}
            {activeModal === 'categorization' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">category</span>
                    Default Categorization
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Determine folder categories when documents are uploaded.</p>
                </div>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Upload Categorization Default</label>
                    <select 
                      value={defaultCategory}
                      onChange={(e) => {
                        setDefaultCategory(e.target.value);
                        localStorage.setItem('pref_default_category', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm font-bold dark:bg-surface"
                    >
                      {['Lab Reports', 'Prescriptions', 'Imaging/Scans', 'Vaccination Card', 'Insurance Docs', 'General Reports'].map(cat => (
                        <option key={cat} value={cat} className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-on-surface-variant">
                    When you drag and drop health files, the application automatically tags files with this category unless overridden.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    Save Preference
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 7: SHARING DEFAULTS --- */}
            {activeModal === 'sharing-defaults' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">share_reviews</span>
                    Sharing & Access Defaults
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">Manage default access limits for emergency and shared contacts.</p>
                </div>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Global Emergency Access Level</label>
                    <select 
                      value={sharingAccessLevel}
                      onChange={(e) => {
                        setSharingAccessLevel(e.target.value);
                        localStorage.setItem('pref_sharing_access', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm font-bold dark:bg-surface"
                    >
                      <option value="Read-Only" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Read-Only (View profile summary only)</option>
                      <option value="Read & Download" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Read & Download (View files + reports)</option>
                      <option value="Read, Write & Audit" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Read, Write & Audit (Full history audit)</option>
                      <option value="Restricted access" className="bg-white dark:bg-[#1f1f21] text-slate-800 dark:text-[#e4e2e4]">Restricted Access (Blocked unless approved)</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-on-surface-variant">
                    Determines what documents emergency personnel can view upon scanning your physical emergency QR code card.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    Save Choice
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 8: UPLOAD QUALITY --- */}
            {activeModal === 'upload-quality' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">hd</span>
                    Upload Quality Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Optimize records storage footprint or details retention.</p>
                </div>

                <div className="space-y-3 py-2">
                  {[
                    { label: 'Lossless (Medical Grade)', desc: 'Keeps high fidelity, recommended for MRI scans & X-rays.' },
                    { label: 'High Quality (Standard)', desc: 'Lightweight compression, suitable for lab reports & textual documents.' },
                    { label: 'Standard Compression', desc: 'Saves storage footprint, faster loading times over poor networks.' }
                  ].map(opt => (
                    <div 
                      key={opt.label}
                      onClick={() => {
                        setUploadQuality(opt.label);
                        localStorage.setItem('pref_upload_quality', opt.label);
                      }}
                      className={`p-3.5 border-2 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between ${
                        uploadQuality === opt.label 
                          ? 'border-[#D4B16F] dark:border-tertiary bg-slate-50 dark:bg-surface-container-low text-slate-900 dark:text-white' 
                          : 'border-slate-100 dark:border-outline-variant hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold">{opt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-on-surface-variant mt-0.5">{opt.desc}</p>
                      </div>
                      {uploadQuality === opt.label && <span className="material-symbols-outlined text-[#D4B16F] dark:text-tertiary">check_circle</span>}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 9: AUTO-CATEGORIZATION --- */}
            {activeModal === 'auto-category' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                    AI Auto-Categorization
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Uses HealthScribe models to sort uploads automatically.</p>
                </div>

                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Document Sorting</p>
                      <p className="text-[10px] text-slate-500 dark:text-on-surface-variant">Read text details and automatically guess category labels.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoCategorization} 
                        onChange={(e) => {
                          setAutoCategorization(e.target.checked);
                          localStorage.setItem('pref_auto_categorization', String(e.target.checked));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 dark:bg-outline-variant rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4B16F] dark:peer-checked:bg-tertiary"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-on-surface-variant">
                    When enabled, scanning a prescription immediately registers the doctor name, medicine timing prompts, and files it in your digital log folder.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 10: FAQ --- */}
            {activeModal === 'faq' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">quiz</span>
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Find answers regarding data storage, safety, and backups.</p>
                </div>

                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {faqData.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="border border-slate-200 dark:border-outline-variant/30 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-container-low hover:bg-slate-100 dark:hover:bg-surface-container-high transition-colors flex justify-between items-center text-left"
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.q}</span>
                        <span className="material-symbols-outlined text-sm text-slate-400">
                          {faqOpenIndex === idx ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                      </button>
                      
                      {faqOpenIndex === idx && (
                        <div className="px-4 py-3 bg-white dark:bg-surface text-[10.5px] text-slate-600 dark:text-on-surface-variant leading-relaxed border-t border-slate-100 dark:border-outline-variant/20 animate-fade-slide-up">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-outline-variant/30 mt-2">
                  <span className="text-[10px] text-slate-400">Can't find answer? Contact support.</span>
                  <button 
                    onClick={() => setActiveModal('support')}
                    className="px-4 py-1.5 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black shadow-sm"
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            )}

            {/* --- MODAL 11: CONTACT SUPPORT --- */}
            {activeModal === 'support' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setSupportSuccess('Support ticket created. We will email you at ' + user?.email);
                  setSupportSubject('');
                  setSupportMessage('');
                  setTimeout(() => {
                    setSupportSuccess('');
                    setActiveModal(null);
                  }, 2500);
                }} 
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">support_agent</span>
                    Contact Tech Support
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit a ticket to our clinical systems support squad.</p>
                </div>

                {supportSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-lg text-xs">
                    {supportSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="e.g. Broken QR emergency profile loading"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Problem Description</label>
                  <textarea 
                    required 
                    rows="4"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe issue with detail..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-outline-variant rounded-lg bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-highest dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}

            {/* --- MODAL 12: PRIVACY POLICY --- */}
            {activeModal === 'privacy-policy' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#dec29a]">policy</span>
                    Privacy Policy
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">HealthVault HIPAA compliance & clinical standards.</p>
                </div>

                <div className="space-y-3 text-[11px] text-slate-600 dark:text-on-surface-variant max-h-[50vh] overflow-y-auto pr-1 leading-relaxed">
                  <h4 className="font-bold text-slate-900 dark:text-white">1. Secure Data Custody</h4>
                  <p>All clinical documents and medical files uploaded to HealthVault are strictly kept in isolated S3 buckets encrypted with custom customer-managed keys (CMK).</p>
                  
                  <h4 className="font-bold text-slate-900 dark:text-white">2. Audit Trails & Logs</h4>
                  <p>Every read, write, or download action is registered in the Audit Ledger. This trail is permanent and complies with HIPAA compliance regulations.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white">3. Patient Sovereignty</h4>
                  <p>The patient has full authority over sharing keys. You can revoke emergency contact accesses or delete records permanently at any time. When deletion is triggered, all keys are shredded immediately from our active clusters.</p>

                  <h4 className="font-bold text-slate-900 dark:text-white">4. AWS Scribe Integration</h4>
                  <p>HealthVault uses private AWS HealthScribe AI containers to analyze doctor notes and scan categories. No clinical details are shared with public models or third-party advertisements.</p>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-outline-variant/30 mt-2">
                  <button 
                    onClick={handleExportData}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-outline-variant bg-slate-50 dark:bg-surface text-xs font-bold text-slate-800 dark:text-white rounded-lg flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export My File
                  </button>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2 bg-[#D4B16F] dark:bg-tertiary text-black rounded-lg text-xs font-black"
                  >
                    Agree
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
