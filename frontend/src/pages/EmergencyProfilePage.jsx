import React, { useEffect, useState } from 'react';
import { ShieldAlert, Phone, Droplet, User, Heart, AlertCircle } from 'lucide-react';

const EmergencyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract ID from pathname: /emergency-profile/:id
  const userId = window.location.pathname.split('/').filter(Boolean).pop();

  useEffect(() => {
    const fetchEmergencyProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/emergency-profile/${userId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch emergency profile');
        }

        const queryParams = new URLSearchParams(window.location.search);
        const memberId = queryParams.get('member');

        if (memberId && data.profile.familyMembers) {
          const member = data.profile.familyMembers.find(
            m => m._id === memberId || m._id?.toString() === memberId.toString()
          );
          if (member) {
            setProfile({
              name: member.name,
              relation: member.relation,
              age: member.age,
              bloodGroup: member.bloodGroup,
              allergies: member.allergies,
              medicalConditions: member.medicalConditions || ['None'],
              emergencyContact: data.profile.emergencyContact, // Inherited emergency contact
              photo: data.profile.photo // Inherited family profile image or generic
            });
            return;
          }
        }

        setProfile({
          ...data.profile,
          relation: 'Self'
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEmergencyProfile();
    } else {
      setError('Invalid Emergency Link');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    /* Premium skeleton shimmer loader instead of spinner */
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 pt-8">
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-950/20 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header Skeleton */}
          <div className="bg-red-950/10 p-5 text-center flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full skeleton-pulse opacity-40"></div>
            <div className="h-4 w-40 rounded skeleton-pulse opacity-40"></div>
            <div className="h-2.5 w-24 rounded skeleton-pulse opacity-20"></div>
          </div>

          {/* Body Skeleton */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-32 h-32 rounded-full border-4 border-slate-800 skeleton-pulse"></div>
              <div className="h-6 w-32 rounded skeleton-pulse"></div>
              <div className="h-3 w-20 rounded skeleton-pulse opacity-60"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 rounded-2xl bg-slate-800/40 skeleton-pulse"></div>
              <div className="h-16 rounded-2xl bg-slate-800/40 skeleton-pulse"></div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded skeleton-pulse opacity-60"></div>
                <div className="h-10 rounded-xl bg-slate-800/40 skeleton-pulse"></div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-40 rounded skeleton-pulse opacity-60"></div>
                <div className="h-12 rounded-xl bg-slate-800/40 skeleton-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-black tracking-tight text-slate-100">Emergency Profile Error</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{error || 'This emergency profile could not be retrieved.'}</p>
        <a
          href="/"
          className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 pt-8">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-600 rounded-3xl overflow-hidden shadow-2xl animate-fade-slide-up">
        
        {/* Urgent Header */}
        <div className="bg-red-600 text-white p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-650 opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <ShieldAlert className="h-10 w-10 animate-pulse text-white drop-shadow-md" />
            <h1 className="text-lg font-black tracking-wider uppercase">EMERGENCY MEDICAL CARD</h1>
            <p className="text-[10px] text-red-100 font-bold tracking-widest uppercase">Verified Patient Record</p>
          </div>
        </div>

        {/* Patient Info Area */}
        <div className="p-6 space-y-6">
          
          {/* Patient Photo and Name */}
          <div className="flex flex-col items-center text-center gap-3">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-red-600/30 shadow-md bg-slate-850"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-red-600/20 flex items-center justify-center shadow-md">
                <User className="h-14 w-14 text-slate-500" />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                {profile.relation === 'Self' ? 'Primary Patient' : `${profile.relation}`}
              </span>
            </div>
          </div>

          {/* Vitals Summary Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Blood type */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-lg text-red-500">
                <Droplet className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Blood Type</span>
                <span className="text-base font-extrabold text-white">{profile.bloodGroup || 'Not Selected'}</span>
              </div>
            </div>

            {/* Age */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Age</span>
                <span className="text-base font-extrabold text-white">{profile.age ? `${profile.age} yrs` : 'Not Set'}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Clinical Summaries */}
          <div className="space-y-4">
            {/* Allergies */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Critical Allergies</span>
              <p className={`text-sm font-bold px-4 py-2.5 rounded-xl mt-1 border ${
                profile.allergies && profile.allergies.toLowerCase() !== 'none'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
              }`}>
                {profile.allergies || 'None'}
              </p>
            </div>

            {/* Medical Conditions */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Existing Medical Conditions</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {profile.medicalConditions && profile.medicalConditions.length > 0 && profile.medicalConditions[0] !== 'None' ? (
                  profile.medicalConditions.map((cond, idx) => (
                    <span key={idx} className="text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-slate-500 italic bg-slate-800/30 border border-slate-850 px-3 py-2 rounded-lg w-full text-center">
                    No chronic medical conditions listed
                  </span>
                )}
              </div>
            </div>

            {/* Emergency Call Box */}
            {profile.emergencyContact && profile.emergencyContact.phone ? (
              <div className="bg-red-950/30 border border-red-900/30 rounded-2xl p-4 flex flex-col gap-3">
                <div>
                  <span className="text-[9px] text-red-400 font-bold block uppercase tracking-wider leading-none mb-1">
                    Emergency Contact Person
                  </span>
                  <span className="text-sm font-extrabold text-white">{profile.emergencyContact.name}</span>
                  {profile.emergencyContact.relation && (
                    <span className="text-xs text-slate-400 block mt-0.5">Relation: {profile.emergencyContact.relation}</span>
                  )}
                </div>
                <a
                  href={`tel:${profile.emergencyContact.phone}`}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4" />
                  Call {profile.emergencyContact.name}
                </a>
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Emergency Contact</span>
                <p className="text-xs text-slate-400 italic mt-1">No emergency contact information listed</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-955 border-t border-slate-800 p-4 text-center">
          <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            HealthVault Life-Saving Consent Network
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProfilePage;
