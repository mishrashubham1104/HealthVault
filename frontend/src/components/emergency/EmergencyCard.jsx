import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, ShieldAlert, Phone, Droplet, User, Heart, Printer, Edit2, Upload, Trash2, Save } from 'lucide-react';
import { updateUserProfileSuccess } from '../../store/slices/authSlice.js';

const EmergencyCard = ({ isOpen, onClose }) => {
  const { user, token } = useSelector(state => state.auth);
  const { activeFamilyMember } = useSelector(state => state.records);
  const dispatch = useDispatch();
  const cardRef = useRef(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [tempAge, setTempAge] = useState('');
  const [tempBloodGroup, setTempBloodGroup] = useState('O-Negative');
  const [tempAllergies, setTempAllergies] = useState('None');
  const [tempPhoto, setTempPhoto] = useState('');
  const [tempContactName, setTempContactName] = useState('');
  const [tempContactRelation, setTempContactRelation] = useState('');
  const [tempContactPhone, setTempContactPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state with user data on open/update
  useEffect(() => {
    if (isOpen && user && !activeFamilyMember) {
      setTempAge(user.age || '');
      setTempBloodGroup(user.bloodGroup || 'O-Negative');
      setTempAllergies(user.allergies || 'None');
      setTempPhoto(user.photo || '');
      setTempContactName(user.emergencyContact?.name || '');
      setTempContactRelation(user.emergencyContact?.relation || '');
      setTempContactPhone(user.emergencyContact?.phone || '');
      setIsEditing(false);
      setError(null);
    }
  }, [isOpen, user, activeFamilyMember]);

  if (!isOpen) return null;

  // Use active family member details or primary user details
  const displaySubject = activeFamilyMember || {
    name: user?.name,
    relation: 'Self',
    age: user?.age,
    bloodGroup: user?.bloodGroup || 'O-Negative',
    allergies: user?.allergies || 'None',
    medicalConditions: user?.medicalConditions || ['None'],
    photo: user?.photo
  };

  const emergencyContact = activeFamilyMember
    ? (user?.emergencyContact || { name: 'Emergency Services', phone: '911' })
    : (user?.emergencyContact || { name: 'Not Configured', phone: '' });

  // Generate public emergency profile link
  const targetProfileUrl = activeFamilyMember
    ? `${window.location.origin}/emergency-profile/${user?._id}?member=${activeFamilyMember._id}`
    : `${window.location.origin}/emergency-profile/${user?._id}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(targetProfileUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Photo size should be less than 2MB");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: tempAge ? Number(tempAge) : undefined,
          bloodGroup: tempBloodGroup,
          allergies: tempAllergies,
          photo: tempPhoto,
          emergencyContact: {
            name: tempContactName,
            relation: tempContactRelation,
            phone: tempContactPhone
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update emergency card details');
      }

      dispatch(updateUserProfileSuccess(data.user));
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 print-overlay">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 emergency-card-to-print">
        
        {/* Card Header */}
        <div className="bg-red-600 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm tracking-wide uppercase">EMERGENCY HEALTH PROFILE</h3>
              <p className="text-[10px] text-red-100 font-bold uppercase tracking-wider mt-0.5">Scan QR for instant access to critical health data</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-red-700/50 hover:bg-red-800 text-white transition-colors no-print"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          /* Editing Form */
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Photo Upload Section */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="relative shrink-0">
                {tempPhoto ? (
                  <img
                    src={tempPhoto}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-accent bg-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 border border-slate-300">
                    <User className="h-10 w-10" />
                  </div>
                )}
                {tempPhoto && (
                  <button
                    type="button"
                    onClick={() => setTempPhoto('')}
                    className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-700 text-white rounded-full p-1 shadow-sm transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Profile Photo</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-accent hover:bg-accent-hover text-white font-bold text-[10px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm uppercase tracking-wider">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mt-1">PNG, JPG (Max 2MB)</span>
              </div>
            </div>

            {/* Age and Blood Group */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Age</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 32"
                  value={tempAge}
                  onChange={(e) => setTempAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-accent text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Blood Group</label>
                <select
                  value={tempBloodGroup}
                  onChange={(e) => setTempBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-accent text-slate-800 cursor-pointer"
                >
                  <option value="A-Positive">A-Positive (A+)</option>
                  <option value="A-Negative">A-Negative (A-)</option>
                  <option value="B-Positive">B-Positive (B+)</option>
                  <option value="B-Negative">B-Negative (B-)</option>
                  <option value="O-Positive">O-Positive (O+)</option>
                  <option value="O-Negative">O-Negative (O-)</option>
                  <option value="AB-Positive">AB-Positive (AB+)</option>
                  <option value="AB-Negative">AB-Negative (AB-)</option>
                </select>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Critical Allergies</label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Peanuts (use 'None' if none)"
                value={tempAllergies}
                onChange={(e) => setTempAllergies(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-accent text-slate-800"
              />
            </div>

            {/* Emergency Contact */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1.5">Emergency Contact Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={tempContactName}
                    onChange={(e) => setTempContactName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Relation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse"
                    value={tempContactRelation}
                    onChange={(e) => setTempContactRelation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 019-2834"
                  value={tempContactPhone}
                  onChange={(e) => setTempContactPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent text-slate-800"
                />
              </div>
            </div>

            {/* Edit Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase tracking-wider shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          /* View mode */
          <>
            <div ref={cardRef} className="p-6 space-y-6">
              <div className="grid grid-cols-5 gap-6">
                
                {/* QR Code Column */}
                <div className="col-span-2 flex flex-col items-center justify-center border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <img 
                    src={qrCodeUrl} 
                    alt="Emergency QR Code" 
                    className="w-32 h-32 object-contain"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/180?text=QR+Code"; }}
                  />
                  <span className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wider text-center">
                    Scan in Emergency
                  </span>
                </div>

                {/* Vital Information */}
                <div className="col-span-3 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      {displaySubject.photo ? (
                        <img
                          src={displaySubject.photo}
                          alt={displaySubject.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Patient Name</span>
                        <p className="text-base font-extrabold text-slate-800 leading-tight truncate">{displaySubject.name}</p>
                        <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                          {displaySubject.relation === 'Self' ? 'Primary Patient' : `${displaySubject.relation}`}
                        </p>
                      </div>
                    </div>

                    {displaySubject.relation === 'Self' && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-550 transition-colors no-print"
                        title="Edit Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <span className="text-[9px] text-red-700 font-bold uppercase block leading-none">Blood Type</span>
                        <span className="text-xs font-extrabold text-slate-850">{displaySubject.bloodGroup || 'Not Set'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-650 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase block leading-none">Age</span>
                        <span className="text-xs font-extrabold text-slate-850">
                          {displaySubject.age ? `${displaySubject.age} yrs` : 'Not Set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Details & Contacts */}
              <div className="space-y-4">
                
                {/* Allergies */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Critical Allergies</span>
                  <p className="text-xs font-extrabold text-red-750 bg-red-50/50 px-3 py-2 rounded-lg mt-1 border border-red-100">
                    {displaySubject.allergies || 'None'}
                  </p>
                </div>

                {/* Medical Conditions */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Existing Medical Conditions</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {displaySubject.medicalConditions && displaySubject.medicalConditions.length > 0 && displaySubject.medicalConditions[0] !== 'None' ? (
                      displaySubject.medicalConditions.map((cond, idx) => (
                        <span key={idx} className="text-xs font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-semibold text-slate-450 italic bg-slate-50 border border-dashed border-slate-200 px-3 py-1.5 rounded-lg w-full text-center">
                        No chronic conditions listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Emergency Contact</span>
                    <span className="text-sm font-extrabold text-slate-850 block truncate">{emergencyContact.name}</span>
                    {emergencyContact.relation && (
                      <span className="text-xs text-slate-500 block">Relation: {emergencyContact.relation}</span>
                    )}
                  </div>
                  {emergencyContact.phone ? (
                    <a 
                      href={`tel:${emergencyContact.phone}`}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition-colors shadow-sm uppercase tracking-wider shrink-0"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {emergencyContact.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">None Provided</span>
                  )}
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-between gap-4">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
                HIPAA-Inspired Security
              </span>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors uppercase tracking-wider"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Card
                </button>
                <button
                  onClick={onClose}
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default EmergencyCard;
