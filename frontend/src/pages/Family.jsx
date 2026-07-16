import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfileSuccess } from '../store/slices/authSlice.js';
import {
  Users,
  Plus,
  ShieldAlert,
  Heart,
  Trash2,
  AlertCircle,
  Sparkles,
  Eye,
  Calendar,
  MoreVertical,
  FileDown,
  Check,
  Activity,
  UserPlus,
  FileText
} from 'lucide-react';
import RecordDetailModal from '../components/records/RecordDetailModal.jsx';

const Family = ({ onEmergencyClick }) => {
  const { user, token } = useSelector(state => state.auth);
  const { records } = useSelector(state => state.records);
  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Child');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-Positive');
  const [allergies, setAllergies] = useState('None');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Local state for interactive toggles in the mock cards
  const [sharedVisibility, setSharedVisibility] = useState({ Elena: true, Robert: false, Leo: true });
  const [emergencyProxy, setEmergencyProxy] = useState({ Elena: false, Robert: true, Leo: false });

  const toggleVisibility = (memberKey) => {
    setSharedVisibility(prev => ({ ...prev, [memberKey]: !prev[memberKey] }));
  };

  const toggleProxy = (memberKey) => {
    setEmergencyProxy(prev => ({ ...prev, [memberKey]: !prev[memberKey] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age) {
      setError('Please provide Name and Age');
      return;
    }

    setLoading(true);
    setError(null);

    const newFamilyMember = {
      name,
      relation,
      age: Number(age),
      bloodGroup,
      allergies
    };

    const updatedFamily = [...(user.familyMembers || []), newFamilyMember];

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familyMembers: updatedFamily })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update family members');
      }

      dispatch(updateUserProfileSuccess(data.user));
      setShowForm(false);

      // Reset
      setName('');
      setRelation('Child');
      setAge('');
      setBloodGroup('O-Positive');
      setAllergies('None');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Remove this family member profile?')) return;

    const updatedFamily = user.familyMembers.filter(m => m._id !== id);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familyMembers: updatedFamily })
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserProfileSuccess(data.user));
      }
    } catch (err) {
      console.error('Failed to delete family member', err);
    }
  };

  // Preset list of family members with images & info (fallback or augmentation)
  const defaultMembers = [
    {
      _id: 'default-1',
      name: 'Elena Chen',
      relation: 'Spouse',
      age: 42,
      lastRecord: 'Routine Lab • Oct 12',
      nextAppt: 'Dental • Nov 05',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIUalhc_8Gm7yAkPDxW4ex8CxOcIM7_6lPxZxDafT5Mye1Eq50CyBPJekq7epLwU_LM4zMwu78blxchITo1lcYZ3q3F6LhvYasCRriDoEEzQW8TluRboBqbOz432KnreF-3Jq_MEVP5htMQA5TNf40eddC49KmquqJCs2UfqEVOeoHbw_9H8AJE0f83oejaVH7jgLaicbalXxk0wFXZ4X3OF-xIhOzqIiiRjul1sUI1pyyberwIkvRlq_LKX8llQsEQCi3fHZTpIcs',
      key: 'Elena'
    },
    {
      _id: 'default-2',
      name: 'Robert Chen',
      relation: 'Parent',
      age: 78,
      alert: 'Blood Pressure Alert: 145/92',
      nextAppt: 'Cardiology • Oct 28',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6q5d7rzjdrrgZQx5Tjsptitz3OOxTzvHbjTVp6tTERBbgv-VJfi1uhzMIxLNJzhTq_clVfQLFDcnJFRzLkPp7Xb1RQIoUHihTOM579oabpBVozhBV22vd2Fw2nP5IjnVUMADw6F2A4kikfM8w8HZ3WDnvOSQ2WY5gBz9_VFIZWb6eB7s4L7-Aa070zweAzvbqoMKz10zvT9GuZqZbYqkmrD0296gEFuwxh_FdFK1OY6qTot7FUSkEPGinsjWfGRJ6xr4qF2AHvXGG',
      key: 'Robert'
    },
    {
      _id: 'default-3',
      name: 'Leo Chen',
      relation: 'Child',
      age: 8,
      lastRecord: 'Vaccinations • Up to date',
      nextAppt: 'Pediatric • Dec 12',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1sF66ClUbPxvd6mChibEbACrAHnrV-qcfKL8lxFDUME64uxCJf4YhFj2rH0URRxTbF5TWAE82ZYRVeeHzNEaMtVvkCeZERuR6YIw_xVuQHiSRn73M_G3P0C_SLnpi4wmcrQeKpamDJa_Pt3ciKKkYNJ67KHwDyeTERZatV3kAdIECHN1kjmJ78E0zxvThfujF5ISUejTjwFXCcn0-BKiUwsf76r5CsmgSnpk6mtq2OdnkvKcMW_MM44y8JB_h12jfBrc5d9wspyZm',
      key: 'Leo'
    }
  ];

  // Merge backend family members with default styling cards
  const displayMembers = user?.familyMembers && user.familyMembers.length > 0
    ? user.familyMembers.map((m, idx) => ({
      ...m,
      image: defaultMembers[idx % defaultMembers.length].image,
      lastRecord: m.allergies !== 'None' ? `Allergy Info: ${m.allergies}` : 'Routine Checkup',
      nextAppt: 'Clinic Visit Scheduled',
      key: m.name.split(' ')[0]
    }))
    : defaultMembers;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter records related to collective family sharing
  const familyRecords = records.filter(r => r.category !== 'Insurance');

  return (
    <div className="space-y-6 text-slate-800 dark:text-on-surface animate-fade-slide-up">

      {/* Title block */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-200 dark:border-outline-variant/30">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Family Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
            Oversee and coordinate health records for your entire household.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover dark:bg-[#bec6e0] dark:text-[#283044] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          Add Family Member
        </button>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/30 rounded-2xl p-6 shadow-xl animate-in slide-in-from-top duration-200 max-w-lg mx-auto">
          <h4 className="text-xs font-bold text-slate-700 dark:text-on-surface uppercase tracking-wider border-b border-slate-100 dark:border-outline-variant/30 pb-2 mb-4">
            Initialize Family Member Profile
          </h4>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Tommy Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-850 dark:text-on-surface"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Relation</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-700 dark:text-on-surface cursor-pointer"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Age</label>
                <input
                  type="number"
                  required
                  placeholder="8"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-855 dark:text-on-surface"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-700 dark:text-on-surface cursor-pointer"
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

            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Allergies</label>
              <input
                type="text"
                placeholder="e.g. Peanuts, Penicillin (use 'None' if none)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-850 dark:text-on-surface"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Initializing...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Cards Grid with hover-lift and stagger animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayMembers.map((member, index) => {
          const isParent = member.relation === 'Parent';
          const isChild = member.relation === 'Child';
          const isAlert = member.alert !== undefined;

          return (
            <div
              key={member._id}
              className={`bg-white dark:bg-surface-container-high rounded-2xl p-5 border border-slate-200 dark:border-outline-variant/10 shadow-sm dark:shadow-soft flex flex-col gap-4 relative overflow-hidden group hover-lift animate-fade-slide-up`}
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`w-16 h-16 rounded-2xl overflow-hidden ring-2 ${isParent ? 'ring-red-500/20' : isChild ? 'ring-tertiary/20' : 'ring-accent/20'
                    }`}>
                    <img
                      alt={member.name}
                      className="w-full h-full object-cover"
                      src={member.image}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-on-surface text-base truncate max-w-[130px]">{member.name}</h3>
                    <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isParent ? 'text-red-550 dark:text-error' : isChild ? 'text-tertiary' : 'text-accent dark:text-primary-stitch'
                      }`}>{member.relation} • Age {member.age}</p>
                  </div>
                </div>
                {member._id && !member._id.startsWith('default-') && (
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    className="p-1 text-slate-355 hover:text-red-600 dark:text-on-surface-variant dark:hover:text-error rounded-md transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Stats / Appts list */}
              <div className="space-y-2">
                {isAlert ? (
                  <div className="flex items-center justify-between text-xs p-2.5 bg-red-50 dark:bg-error-container/10 border border-red-100 dark:border-error/20 rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold text-red-650 dark:text-error">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{member.alert}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-surface-container-low rounded-xl font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-on-surface-variant">
                      <FileText className="h-4 w-4 text-tertiary" />
                      <span>Last Record</span>
                    </div>
                    <span className="text-slate-800 dark:text-on-surface truncate max-w-[120px]">{member.lastRecord || 'Lab Results • Oct 12'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-surface-container-low rounded-xl font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-on-surface-variant">
                    <Calendar className="h-4 w-4 text-accent dark:text-primary-stitch" />
                    <span>Next Appt.</span>
                  </div>
                  <span className="text-slate-800 dark:text-on-surface truncate max-w-[120px]">{member.nextAppt || 'Dental Consult • Nov 05'}</span>
                </div>
              </div>

              {/* Toggles footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-outline-variant/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-on-surface-variant">
                <span>{isParent ? 'Emergency Proxy' : 'Shared Visibility'}</span>
                <button
                  type="button"
                  onClick={() => isParent ? toggleProxy(member.key) : toggleVisibility(member.key)}
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${(isParent ? emergencyProxy[member.key] : sharedVisibility[member.key])
                      ? 'bg-accent dark:bg-primary-stitch justify-end'
                      : 'bg-slate-200 dark:bg-on-secondary-fixed-variant/50 justify-start'
                    }`}
                >
                  <span className="h-4 w-4 bg-white rounded-full shadow-sm"></span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Records Table Section with stagger animation */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-outline-variant/30">
          <h3 className="font-extrabold text-slate-850 dark:text-on-surface text-base sm:text-lg">Collective Family Records</h3>
          <div className="flex gap-2">
            <span className="bg-slate-100 dark:bg-surface-container px-2.5 py-1 rounded text-[10px] font-bold text-slate-500 dark:text-on-surface-variant border border-slate-200/50 dark:border-outline-variant/20 uppercase">All Members</span>
            <span className="bg-accent-light dark:bg-surface-container-highest px-2.5 py-1 rounded text-[10px] font-bold text-accent dark:text-primary-stitch border border-accent/20 dark:border-primary/20 uppercase">Recent Updates</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container rounded-2xl overflow-hidden shadow-sm dark:shadow-soft border border-slate-200 dark:border-outline-variant/20 hover-lift duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55 dark:bg-surface-container-highest/50 border-b border-slate-150 dark:border-outline-variant/30">
                <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface-variant">Patient</th>
                <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface-variant">Document Name</th>
                <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface-variant">Category</th>
                <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface-variant">Date Added</th>
                <th className="px-5 py-3 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-on-surface-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-outline-variant/10 text-xs font-semibold text-slate-650 dark:text-on-surface">
              {familyRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium italic">
                    No family records stored in the locker.
                  </td>
                </tr>
              ) : (
                familyRecords.slice(0, 4).map((record, index) => {
                  const names = ['Elena Chen', 'Leo Chen', 'Robert Chen', user?.name || 'Alex Rivera'];
                  const images = [
                    defaultMembers[0].image,
                    defaultMembers[2].image,
                    defaultMembers[1].image,
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCj8uH__VjmNv-yZ-qo-I6mUU2nmH9tj27Jhaz7DqsCxbzHLayYTZ5LdeySXpcyYHiurCXsxXHv7wBG-CLQlp2SymlJ0WwR8NL4QMZgsfwW1_cwci3c3vSVRMZu41dhLRxNVOmI1II6oRsIK0o9PIWelcrQa09prmndICCbSiYr2p534jU8rlBWopYSo-Qi2wDMzqB0Nj1_aBOg9_2LwlSolbXvHzAkzSKDEETNv8UDWmfC340j6M_VgvQZdomujEWJ4MCjoQUOLW9Y'
                  ];
                  const patientIndex = index % names.length;

                  return (
                    <tr
                      key={record._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors animate-fade-slide-up"
                      style={{ animationDelay: `${(index + 1) * 60}ms` }}
                    >
                      <td className="px-5 py-3.5 flex items-center gap-2">
                        <img
                          alt="Patient Thumbnail"
                          className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-outline-variant"
                          src={images[patientIndex]}
                        />
                        <span className="font-bold">{names[patientIndex]}</span>
                      </td>
                      <td className="px-5 py-3.5 truncate max-w-[200px]">{record.title}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-primary/10 text-slate-500 dark:text-primary-stitch text-[9px] font-bold uppercase tracking-wider border border-slate-200/50 dark:border-primary/20">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-450 dark:text-on-surface-variant">{formatDate(record.date)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => { setSelectedRecord(record); setIsDetailOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-accent dark:hover:text-primary-stitch rounded-lg transition-colors"
                          title="Open Record Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Permissions / Sovereignty & Emergency Proxies Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-surface-container rounded-2xl p-5 border border-slate-200 dark:border-outline-variant/10 shadow-sm space-y-4 hover-lift duration-300">
          <div className="flex items-center gap-3 border-b border-slate-50 dark:border-outline-variant/10 pb-3">
            <span className="p-2.5 bg-blue-50 dark:bg-primary-container rounded-xl text-blue-600 dark:text-primary-stitch">
              <Plus className="h-6 w-6" />
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-on-surface">Data Sovereignty</h4>
              <p className="text-xs text-slate-450 dark:text-on-surface-variant font-semibold">You are the primary guardian of this vault.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-surface-container-low rounded-xl border border-slate-150 dark:border-outline-variant/10 font-bold text-xs text-slate-700 dark:text-on-surface">
              <div>
                <p>Two-Factor Family Access</p>
                <p className="text-[10px] text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Require secondary approval for record sharing.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisibility('Elena')}
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${sharedVisibility['Elena'] ? 'bg-accent dark:bg-primary-stitch justify-end' : 'bg-slate-200 dark:bg-on-secondary-fixed-variant/50 justify-start'
                  }`}
              >
                <span className="h-4 w-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-surface-container-low rounded-xl border border-slate-150 dark:border-outline-variant/10 font-bold text-xs text-slate-700 dark:text-on-surface">
              <div>
                <p>Activity Monitoring</p>
                <p className="text-[10px] text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Log every instance of record views.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisibility('Leo')}
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${sharedVisibility['Leo'] ? 'bg-accent dark:bg-primary-stitch justify-end' : 'bg-slate-200 dark:bg-on-secondary-fixed-variant/50 justify-start'
                  }`}
              >
                <span className="h-4 w-4 bg-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 dark:bg-tertiary-container/10 p-5 rounded-2xl border border-amber-200/50 dark:border-tertiary/20 flex flex-col justify-between hover-lift duration-300">
          <div>
            <h4 className="font-extrabold text-sm text-amber-700 dark:text-tertiary mb-1">Emergency Sharing Proxies</h4>
            <p className="text-xs text-slate-550 dark:text-on-tertiary-container/85 font-medium leading-relaxed mb-6">
              In case of emergency, designate who can access critical records without immediate approval.
            </p>
          </div>
          <div className="flex -space-x-3 overflow-hidden mb-6">
            <img
              alt="User"
              className="inline-block h-12 w-12 rounded-full ring-4 ring-white dark:ring-surface-container object-cover"
              src={defaultMembers[0].image}
            />
            <img
              alt="User"
              className="inline-block h-12 w-12 rounded-full ring-4 ring-white dark:ring-surface-container object-cover"
              src={defaultMembers[1].image}
            />
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-surface-container-highest text-slate-650 dark:text-tertiary ring-4 ring-white dark:ring-surface-container font-extrabold text-xs">
              +2
            </div>
          </div>
          <button
            onClick={onEmergencyClick}
            className="w-full py-2.5 border border-accent dark:border-tertiary text-accent dark:text-tertiary font-bold rounded-xl hover:bg-accent/5 dark:hover:bg-tertiary/10 transition-all text-xs focus:outline-none"
          >
            Manage Proxies
          </button>
        </div>
      </section>

      {/* Detail Viewer Modal */}
      <RecordDetailModal
        record={selectedRecord}
        isOpen={isDetailOpen}
        onClose={() => {
          isDetailOpen && setIsDetailOpen(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
};

export default Family;
