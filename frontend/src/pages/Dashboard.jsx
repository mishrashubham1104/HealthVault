import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addVisitSuccess } from '../store/slices/recordSlice.js';
import {
  Heart,
  Activity,
  Droplet,
  Shield,
  Search,
  Bell,
  FileText,
  Stethoscope,
  Calendar,
  Plus,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Eye,
  Menu,
  X,
  ChevronRight,
  Edit2,
  Brain,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import RecordDetailModal from '../components/records/RecordDetailModal.jsx';

// Stats Counter Component
const AnimatedCounter = ({ value, duration = 500, formatter = (val) => val }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      setCount(value);
      return;
    }
    const range = end - start;
    let current = start;
    const steps = 25;
    const stepTime = Math.max(Math.floor(duration / steps), 15);
    const stepIncrement = Math.ceil(range / steps);

    let stepCount = 0;
    const timer = setInterval(() => {
      stepCount++;
      current += stepIncrement;
      if (stepCount >= steps || (stepIncrement > 0 ? current >= end : current <= end)) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{formatter(count)}</span>;
};

const Dashboard = ({ onMenuClick, setActivePage, setLegalTab, searchQuery }) => {
  const { token, user } = useSelector(state => state.auth);
  const { records, reminders, visits } = useSelector(state => state.records);
  const dispatch = useDispatch();

  const [showAddVisit, setShowAddVisit] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track completed medications (takenMeds state)
  const [takenMeds, setTakenMeds] = useState(() => {
    const cached = localStorage.getItem('takenMeds');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return ['med-1', 'med-3'];
  });

  // Track dynamic vitals state
  const [vitals, setVitals] = useState(() => {
    const cached = localStorage.getItem('vitals');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      heartRate: 72,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      bloodSugar: 94
    };
  });
  const [showLogVitals, setShowLogVitals] = useState(false);
  const [vitalHeartRate, setVitalHeartRate] = useState(() => vitals.heartRate.toString());
  const [vitalSystolic, setVitalSystolic] = useState(() => vitals.bloodPressureSystolic.toString());
  const [vitalDiastolic, setVitalDiastolic] = useState(() => vitals.bloodPressureDiastolic.toString());
  const [vitalBloodSugar, setVitalBloodSugar] = useState(() => vitals.bloodSugar.toString());

  const openLogVitals = () => {
    setVitalHeartRate(vitals.heartRate.toString());
    setVitalSystolic(vitals.bloodPressureSystolic.toString());
    setVitalDiastolic(vitals.bloodPressureDiastolic.toString());
    setVitalBloodSugar(vitals.bloodSugar.toString());
    setShowLogVitals(true);
  };

  // AI Insight detailed modal state
  const [showAiInsightModal, setShowAiInsightModal] = useState(false);

  // Record details modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Health Timeline items detailed modal state
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Two factor authentication toggle state
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);

  const getVitalsInsights = (v) => {
    const hr = parseInt(v.heartRate, 10) || 72;
    const sys = parseInt(v.bloodPressureSystolic, 10) || 118;
    const dia = parseInt(v.bloodPressureDiastolic, 10) || 76;
    const bs = parseInt(v.bloodSugar, 10) || 94;

    // Define segments for the main recommendation to reflect exact values dynamically
    let hrStatus = "";
    if (hr > 100) {
      hrStatus = `elevated (${hr} BPM)`;
    } else if (hr < 60) {
      hrStatus = `lower than average (${hr} BPM)`;
    } else {
      hrStatus = `optimal (${hr} BPM)`;
    }

    let bpStatus = "";
    if (sys >= 130 || dia >= 85) {
      bpStatus = `elevated (${sys}/${dia} mmHg)`;
    } else if (sys >= 120 || dia >= 80) {
      bpStatus = `pre-hypertensive range (${sys}/${dia} mmHg)`;
    } else if (sys < 90 || dia < 60) {
      bpStatus = `low (${sys}/${dia} mmHg)`;
    } else {
      bpStatus = `healthy (${sys}/${dia} mmHg)`;
    }

    let glucoseStatus = "";
    if (bs >= 140) {
      glucoseStatus = `high (${bs} mg/dL)`;
    } else if (bs >= 100) {
      glucoseStatus = `in the pre-diabetic range (${bs} mg/dL)`;
    } else if (bs < 70) {
      glucoseStatus = `low (${bs} mg/dL)`;
    } else {
      glucoseStatus = `stable (${bs} mg/dL)`;
    }

    // Combine into a truly dynamic main wellness statement
    let mainRecommendation = `AI Assessment: Core vitals verified. Your resting heart rate is ${hrStatus}, blood pressure is ${bpStatus}, and blood glucose levels are ${glucoseStatus}. `;

    // Append dynamic, actionable advice
    if (bs >= 140 || sys >= 130 || dia >= 85 || hr > 100) {
      const issues = [];
      if (bs >= 140) issues.push("restrict simple sugars and monitor glycemic levels");
      if (sys >= 130 || dia >= 85) issues.push("decrease dietary sodium and monitor BP daily");
      if (hr > 100) issues.push("avoid caffeine, focus on hydration, and rest");
      mainRecommendation += `We recommend you ${issues.join(", and ")}. Please consult with Dr. Sarah Aris if these parameters persist in higher bounds.`;
    } else if (bs >= 100 || sys >= 120 || dia >= 80) {
      const checks = [];
      if (bs >= 100) checks.push("check post-meal sugar variations");
      if (sys >= 120 || dia >= 80) checks.push("practice light relaxation techniques");
      mainRecommendation += `We suggest small routine adjustments like ${checks.join(" and ")} to keep your metrics stable.`;
    } else {
      mainRecommendation += `All parameters are within normal physiological bounds. Keep up your active lifestyle, balanced dietary habits, and routine checkups!`;
    }

    // 2. Dynamic cardiovascular health paragraph
    let cardioTitle = "Cardiovascular Health: Stable";
    let cardioBgClass = "bg-emerald-500/10 border-emerald-500/20";
    let cardioTextClass = "text-emerald-700 dark:text-emerald-400";
    let cardioDesc = `With a resting heart rate of ${hr} BPM and optimal blood pressure at ${sys}/${dia} mmHg, your cardiovascular parameters are stable. Continue current aerobic routines.`;

    if (sys >= 130 || dia >= 85 || hr > 100) {
      cardioTitle = "Cardiovascular Health: Attention Suggested";
      cardioBgClass = "bg-amber-500/10 border-amber-500/20";
      cardioTextClass = "text-amber-700 dark:text-amber-400";
      
      const bpIssue = (sys >= 130 || dia >= 85) ? "elevated blood pressure" : "";
      const hrIssue = (hr > 100) ? "high resting heart rate" : "";
      const combinedIssues = [bpIssue, hrIssue].filter(Boolean).join(" and ");

      cardioDesc = `Your vitals indicate ${combinedIssues} (${sys}/${dia} mmHg, ${hr} BPM). We suggest resting, avoiding stimulants, and discussing these readings with a medical provider.`;
    } else if (sys < 90 || dia < 60 || hr < 60) {
      cardioTitle = "Cardiovascular Health: Low Range Alert";
      cardioBgClass = "bg-blue-500/10 border-blue-500/20";
      cardioTextClass = "text-blue-700 dark:text-blue-400";
      cardioDesc = `Your blood pressure (${sys}/${dia} mmHg) or heart rate (${hr} BPM) is below average. If you experience lightheadedness, fatigue, or fainting, consult your clinician.`;
    }

    // 3. Dynamic blood sugar/glucose panel
    let glucoseTitle = "Metabolic Health: Stable";
    let glucoseBgClass = "bg-emerald-500/10 border-emerald-500/20";
    let glucoseTextClass = "text-emerald-700 dark:text-emerald-400";
    let glucoseDesc = `Your blood glucose is stable at ${bs} mg/dL, which is within the normal fasting range. Maintain your current diet and active lifestyle.`;

    if (bs >= 140) {
      glucoseTitle = "Metabolic Health: High Blood Sugar";
      glucoseBgClass = "bg-rose-500/10 border-rose-500/20";
      glucoseTextClass = "text-rose-700 dark:text-rose-400";
      glucoseDesc = `Your blood sugar is elevated at ${bs} mg/dL. Monitor your carbohydrate intake, maintain hydration, and consult Dr. Sarah Aris if fasting values remain above 126 mg/dL.`;
    } else if (bs >= 100) {
      glucoseTitle = "Metabolic Health: Pre-diabetic Range";
      glucoseBgClass = "bg-amber-500/10 border-amber-500/20";
      glucoseTextClass = "text-amber-700 dark:text-amber-400";
      glucoseDesc = `Your blood glucose is ${bs} mg/dL, which falls in the pre-diabetic range. We recommend tracking post-meal blood sugar levels and increasing physical activity.`;
    }

    // 4. Dynamic actionable lifestyle steps
    const lifestyleSteps = [
      "Maintain consistent medication schedule for reminders."
    ];

    if (bs >= 100) {
      lifestyleSteps.unshift(`Limit intake of processed sugars and monitor pre/post meal blood glucose levels (Current: ${bs} mg/dL).`);
    } else {
      lifestyleSteps.unshift(`Maintain a balanced diet rich in fiber and whole grains (Current Blood Glucose: ${bs} mg/dL).`);
    }

    if (sys >= 120 || dia >= 80) {
      lifestyleSteps.unshift(`Reduce dietary sodium intake and practice deep breathing or stress management techniques (Current BP: ${sys}/${dia} mmHg).`);
    } else {
      lifestyleSteps.unshift(`Keep up sodium control and hydration (Current BP: ${sys}/${dia} mmHg is healthy).`);
    }
    
    if (hr > 100) {
      lifestyleSteps.unshift(`Ensure adequate hydration and avoid energy drinks or heavy stimulants (Current Heart Rate: ${hr} BPM).`);
    } else {
      lifestyleSteps.unshift(`Engage in regular moderate intensity aerobic exercises (Current Heart Rate: ${hr} BPM is stable).`);
    }

    return {
      mainRecommendation,
      cardioTitle,
      cardioBgClass,
      cardioTextClass,
      cardioDesc,
      glucoseTitle,
      glucoseBgClass,
      glucoseTextClass,
      glucoseDesc,
      lifestyleSteps
    };
  };

  const insights = getVitalsInsights(vitals);

  // Format date helper
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to determine heart rate status
  const getHeartRateStatus = (hr) => {
    const rate = parseInt(hr, 10);
    if (isNaN(rate)) return { text: 'Normal', colorClass: 'text-tertiary', barColor: 'bg-[#bec6e0]' };
    if (rate > 100) return { text: 'High', colorClass: 'text-error', barColor: 'bg-error' };
    if (rate < 60) return { text: 'Low', colorClass: 'text-amber-400', barColor: 'bg-amber-400' };
    return { text: 'Normal', colorClass: 'text-tertiary', barColor: 'bg-accent' };
  };

  // Helper to determine blood pressure status
  const getBPStatus = (sys, dia) => {
    const s = parseInt(sys, 10);
    const d = parseInt(dia, 10);
    if (isNaN(s) || isNaN(d)) return { text: 'Optimal', colorClass: 'text-tertiary' };
    if (s >= 130 || d >= 85) return { text: 'Elevated', colorClass: 'text-error' };
    if (s >= 120 || d >= 80) return { text: 'Normal', colorClass: 'text-[#bec6e0]' };
    return { text: 'Optimal', colorClass: 'text-tertiary' };
  };

  // Helper to determine blood sugar status
  const getBloodSugarStatus = (bs) => {
    const val = parseInt(bs, 10);
    if (isNaN(val)) return { text: 'Normal', colorClass: 'text-tertiary' };
    if (val >= 140) return { text: 'High', colorClass: 'text-error' };
    if (val >= 100) return { text: 'Check Diet', colorClass: 'text-error' };
    return { text: 'Optimal', colorClass: 'text-tertiary' };
  };

  const handleLogVitalsSubmit = (e) => {
    e.preventDefault();
    const hr = parseInt(vitalHeartRate, 10) || 72;
    const sys = parseInt(vitalSystolic, 10) || 118;
    const dia = parseInt(vitalDiastolic, 10) || 76;
    const bs = parseInt(vitalBloodSugar, 10) || 94;

    const newVitals = {
      heartRate: hr,
      bloodPressureSystolic: sys,
      bloodPressureDiastolic: dia,
      bloodSugar: bs
    };

    setVitals(newVitals);
    localStorage.setItem('vitals', JSON.stringify(newVitals));
    setShowLogVitals(false);
  };

  const toggleMedCompleted = (medId) => {
    setTakenMeds(prev => {
      const next = prev.includes(medId) ? prev.filter(id => id !== medId) : [...prev, medId];
      localStorage.setItem('takenMeds', JSON.stringify(next));
      return next;
    });
  };

  const toggleTwoFactor = () => {
    setTwoFactor(!twoFactor);
  };

  const handleOpenRecord = (record) => {
    const realRecord = records.find(r => r._id === record.id);
    if (realRecord) {
      setSelectedRecord(realRecord);
      setIsRecordModalOpen(true);
    } else {
      setSelectedRecord({
        _id: record.id,
        title: record.title,
        category: record.type,
        provider: record.provider,
        date: new Date(record.date).toISOString(),
        description: `This is a mock record of type ${record.type} for testing purposes.`,
        ocrText: `Sample OCR content for ${record.title}:\nPatient Name: John Doe\nResult Value: Normal Range\nNotes: No significant abnormalities detected.`,
        aiExplanation: `### AI Assessment\n- The test result for **${record.title}** looks within normal physiological limits.\n- Consult with your clinician for a detailed report interpretation.`
      });
      setIsRecordModalOpen(true);
    }
  };

  const handleOpenTimelineItem = (item) => {
    setSelectedTimelineItem(item);
    setIsTimelineModalOpen(true);
  };

  const handleAddVisitSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName || !specialty) {
      setError('Doctor name and specialty are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rxArray = prescriptions.split(',').map(p => p.trim()).filter(p => p.length > 0);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/health/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorName,
          specialty,
          date,
          diagnosis,
          notes,
          prescriptions: rxArray
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save visit logs');
      }

      dispatch(addVisitSuccess(data.visit));
      setShowAddVisit(false);

      // Reset Form
      setDoctorName('');
      setSpecialty('');
      setDiagnosis('');
      setNotes('');
      setPrescriptions('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Map dynamic records to Recent Records list (with fallback to mockup items)
  const displayRecords = records.length > 0 ? records.slice(0, 3).map(r => ({
    id: r._id,
    type: r.category === 'Prescription' ? 'Prescription' : r.category === 'Imaging' ? 'Imaging' : 'Diagnostics',
    title: r.title,
    provider: r.provider || 'City Health Labs',
    date: formatDate(r.date),
    status: r.status || 'FINAL'
  })) : [
    { id: 'mock-1', type: 'Diagnostics', title: 'Full Blood Count', provider: 'City Health Labs', date: 'Oct 12, 2024', status: 'FINAL' },
    { id: 'mock-2', type: 'Prescription', title: 'Lisinopril 10mg', provider: 'Dr. Sarah Aris', date: 'Sep 28, 2024', status: 'ACTIVE' },
    { id: 'mock-3', type: 'Imaging', title: 'Chest X-Ray', provider: 'Radiology Central', date: 'Aug 15, 2024', status: 'ARCHIVED' }
  ];

  // Filter records based on search query
  const query = searchQuery || '';
  const filteredRecords = displayRecords.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.provider.toLowerCase().includes(query.toLowerCase()) ||
    r.type.toLowerCase().includes(query.toLowerCase())
  );

  // Map reminders to Daily Meds list
  const displayMeds = reminders.length > 0 ? reminders.slice(0, 3).map((r) => ({
    id: r._id,
    title: r.title,
    dosage: r.dosage,
    time: r.time,
    isCompleted: takenMeds.includes(r._id)
  })) : [
    { id: 'med-1', title: 'Metformin 500mg', dosage: 'With Breakfast', time: '08:30 AM', isCompleted: takenMeds.includes('med-1') },
    { id: 'med-2', title: 'Multivitamin', dosage: 'After Lunch', time: '01:00 PM', isCompleted: takenMeds.includes('med-2') },
    { id: 'med-3', title: 'Lisinopril 10mg', dosage: 'Before Bed', time: '09:00 PM', isCompleted: takenMeds.includes('med-3') }
  ];

  // Filter meds based on search
  const filteredMeds = displayMeds.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.dosage.toLowerCase().includes(query.toLowerCase())
  );

  // Map visits to Timeline items
  const displayTimeline = visits.length > 0 ? visits.slice(0, 3).map(v => ({
    id: v._id,
    date: formatDate(v.date),
    title: `Primary Care Visit`,
    subtitle: `Dr. ${v.doctorName} • ${v.specialty} consultation`,
    diagnosis: v.diagnosis,
    prescriptions: v.prescriptions || [],
    notes: v.notes
  })) : [
    { id: 'time-1', date: 'Oct 12, 2024', title: 'Lab Test: Blood Panel', subtitle: 'City Health Labs • Results available in Vault', notes: 'Complete metabolic panel and blood count. Vitamin D is low.' },
    { id: 'time-2', date: 'Sep 28, 2024', title: 'Primary Care Visit', subtitle: 'Dr. Sarah Aris • Annual Wellness Check', notes: 'Routine checkup. Discussed nutrition and cardiovascular fitness. Patient is in good physical shape.', diagnosis: 'Healthy Checkup' },
    { id: 'time-3', date: 'Aug 02, 2024', title: 'Vaccination: Flu Shot', subtitle: 'CVS Pharmacy • Batch #8832-AZ', notes: 'Annual influenza vaccine administered in the left arm.' }
  ];

  // Filter timeline based on search
  const filteredTimeline = displayTimeline.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-on-surface animate-fade-slide-up">

      {/* Title Row */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-200 dark:border-outline-variant/30">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Health Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-on-surface-variant mt-1">
            Summary of your vital data as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openLogVitals}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover dark:bg-[#bec6e0]/10 dark:hover:bg-[#bec6e0]/20 dark:border dark:border-[#bec6e0]/30 text-white dark:text-primary-stitch font-bold text-xs px-4 py-2 rounded-lg transition-all"
          >
            <Activity className="h-4 w-4" />
            Log Vitals
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-high dark:hover:bg-surface-variant text-slate-800 dark:text-on-surface border border-slate-200 dark:border-outline-variant/30 font-bold text-xs px-4 py-2 rounded-lg transition-all"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Conditional Add Visit Form */}
      {showAddVisit && (
        <div className="bg-white dark:bg-surface-container border border-slate-250 dark:border-outline-variant/30 rounded-2xl p-6 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-outline-variant/30 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-accent dark:text-tertiary" />
              Log Physician Consultation
            </h3>
            <button onClick={() => setShowAddVisit(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm transition-colors">
              Close
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-xs font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAddVisitSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Doctor Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Alan Mercer"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Specialty</label>
              <input
                type="text"
                required
                placeholder="Cardiologist, GP"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Visit Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Primary Diagnosis</label>
              <input
                type="text"
                placeholder="e.g. Stage 1 Hypertension, Seasonal Allergies"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Prescribed Medicines (comma separated)</label>
              <input
                type="text"
                placeholder="Lisinopril 10mg daily, Benadryl Syrup as needed"
                value={prescriptions}
                onChange={(e) => setPrescriptions(e.target.value)}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase block mb-1">Consultation Summary / Doctor Notes</label>
              <textarea
                placeholder="Advice, follow-up parameters, dietary restrictions details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-primary-stitch text-slate-800 dark:text-on-surface resize-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-accent dark:bg-[#bec6e0] dark:text-[#283044] hover:opacity-90 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving Logs...' : 'Save Consultation Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vitals Grid Row with stagger reveal and hover lifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Heart Rate */}
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover-lift stagger-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Heart Rate</span>
              <span className="text-3xl font-black tracking-tight">
                <AnimatedCounter value={vitals.heartRate} /> <span className="text-xs font-normal text-slate-400 dark:text-on-surface-variant">BPM</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 ${getHeartRateStatus(vitals.heartRate).colorClass}`}>
                {getHeartRateStatus(vitals.heartRate).text}
              </span>
              <div className="p-2 bg-red-500/10 dark:bg-primary-container rounded-lg text-red-500 dark:text-primary-stitch">
                <Heart className="h-4.5 w-4.5 animate-pulse" />
              </div>
            </div>
          </div>
          {/* Sparkline style custom visualizer */}
          <div className="mt-6">
            <div className="h-1.5 bg-slate-100 dark:bg-outline-variant/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent dark:bg-primary-stitch rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, (vitals.heartRate / 180) * 100))}%` }}></div>
            </div>
          </div>
          <button
            onClick={openLogVitals}
            className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:text-on-surface-variant dark:hover:text-on-surface flex items-center gap-1 transition-all focus:outline-none opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3 w-3" /> Update
          </button>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover-lift stagger-2 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Blood Pressure</span>
              <span className="text-3xl font-black tracking-tight">
                <AnimatedCounter value={vitals.bloodPressureSystolic} />/<AnimatedCounter value={vitals.bloodPressureDiastolic} /> <span className="text-xs font-normal text-slate-400 dark:text-on-surface-variant">mmHg</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500/10 dark:bg-teal-500/15 ${getBPStatus(vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic).colorClass}`}>
                {getBPStatus(vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic).text}
              </span>
              <div className="p-2 bg-teal-500/10 dark:bg-teal-500/15 rounded-lg text-teal-600 dark:text-secondary-stitch">
                <Activity className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
          {/* Sparkline columns */}
          <div className="mt-6 flex items-end gap-1 h-6">
            <div className="w-full bg-accent/30 dark:bg-primary-stitch/30 h-3 rounded-sm"></div>
            <div className="w-full bg-accent/30 dark:bg-primary-stitch/30 h-5 rounded-sm"></div>
            <div className="w-full bg-accent dark:bg-primary-stitch h-4 rounded-sm"></div>
            <div className="w-full bg-accent/60 dark:bg-primary-stitch/60 h-6 rounded-sm"></div>
            <div className="w-full bg-accent/30 dark:bg-primary-stitch/30 h-5 rounded-sm"></div>
            <div className="w-full bg-accent dark:bg-primary-stitch h-7 rounded-sm"></div>
          </div>
          <button
            onClick={openLogVitals}
            className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:text-on-surface-variant dark:hover:text-on-surface flex items-center gap-1 transition-all focus:outline-none opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3 w-3" /> Update
          </button>
        </div>

        {/* Blood Glucose */}
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover-lift stagger-3 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Blood Glucose</span>
              <span className="text-3xl font-black tracking-tight">
                <AnimatedCounter value={vitals.bloodSugar} /> <span className="text-xs font-normal text-slate-400 dark:text-on-surface-variant">mg/dL</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-500/10 dark:bg-tertiary-container/30 ${getBloodSugarStatus(vitals.bloodSugar).colorClass}`}>
                {getBloodSugarStatus(vitals.bloodSugar).text}
              </span>
              <div className="p-2 bg-amber-500/10 dark:bg-tertiary-container/30 rounded-lg text-amber-500 dark:text-tertiary">
                <Droplet className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
          {/* Sparkline columns */}
          <div className="mt-6 flex items-end gap-1 h-6">
            <div className="w-full bg-amber-500/30 dark:bg-tertiary/30 h-5 rounded-sm"></div>
            <div className="w-full bg-amber-500/30 dark:bg-tertiary/30 h-4 rounded-sm"></div>
            <div className="w-full bg-amber-500 dark:bg-tertiary h-6 rounded-sm"></div>
            <div className="w-full bg-amber-500/60 dark:bg-tertiary/60 h-4 rounded-sm"></div>
            <div className="w-full bg-amber-500/30 dark:bg-tertiary/30 h-5 rounded-sm"></div>
            <div className="w-full bg-amber-500 dark:bg-tertiary h-7 rounded-sm"></div>
          </div>
          <button
            onClick={openLogVitals}
            className="absolute bottom-3 right-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:text-on-surface-variant dark:hover:text-on-surface flex items-center gap-1 transition-all focus:outline-none opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3 w-3" /> Update
          </button>
        </div>

        {/* Security Info */}
        <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between hover-lift stagger-4 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 dark:bg-primary-container rounded-lg text-blue-500 dark:text-primary-stitch">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-primary leading-tight">Security Active</h4>
                <p className="text-[10px] text-slate-400 dark:text-on-primary-container font-semibold">HIPAA Level Encryption</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-outline-variant/20">
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-on-primary-container mb-1.5 font-bold uppercase tracking-wider">
              <span>2FA Security</span>
              <button
                onClick={toggleTwoFactor}
                className="text-accent dark:text-primary-stitch hover:underline font-extrabold"
              >
                {twoFactor ? "Verified" : "Enable"}
              </button>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-on-secondary-container/20 rounded-full overflow-hidden">
              <div className={`h-full bg-accent dark:bg-primary-stitch rounded-full transition-all duration-500 ${twoFactor ? 'w-full' : 'w-1/3'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="bg-teal-50/40 dark:bg-surface-container-low border border-teal-100/80 dark:border-outline-variant/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm dark:shadow-xl relative overflow-hidden hover-lift duration-300">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="p-3 bg-teal-500/10 dark:bg-tertiary/20 rounded-xl text-teal-600 dark:text-tertiary shrink-0">
          <Brain className="h-6 w-6" />
        </div>
        <div className="flex-grow min-w-0 relative z-10">
          <h3 className="font-extrabold text-sm tracking-wide text-teal-700 dark:text-tertiary">AI Insight: Wellness Recommendation</h3>
          <p className="text-xs text-slate-600 dark:text-on-surface-variant font-semibold mt-1 leading-relaxed">
            "{insights.mainRecommendation}"
          </p>
        </div>
        <button
          onClick={() => setShowAiInsightModal(true)}
          className="text-accent hover:text-accent-hover dark:text-accent dark:hover:text-accent-hover font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors focus:outline-none"
        >
          View detailed report analysis &rarr;
        </button>
      </div>

      {/* Lower Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Side: Recent Records Table */}
        <div className="lg:col-span-8 bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-6 shadow-sm dark:shadow-xl hover-lift duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-on-surface text-base tracking-wide">Recent Records</h3>
              <p className="text-xs text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Most recent medical diagnostic uploads</p>
            </div>
            <button
              onClick={() => setActivePage('records')}
              className="text-accent hover:underline dark:text-primary-stitch dark:hover:text-[#bcc7de] dark:no-underline font-bold text-xs transition-colors focus:outline-none"
            >
              See All Vault &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                No records match your search query.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-outline-variant/50 bg-slate-50 dark:bg-surface-container text-[10px] font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-widest">
                    <th className="px-4 py-3">Record Type</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-outline-variant/10 text-xs font-semibold">
                  {filteredRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors animate-fade-slide-up`}
                      style={{ animationDelay: `${(index + 1) * 50}ms` }}
                    >
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 dark:bg-surface-container-high rounded text-red-500 dark:text-tertiary shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-slate-800 dark:text-on-surface">{record.title}</span>
                          <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-medium">{record.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-on-surface-variant">{record.provider}</td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-on-surface-variant">{record.date}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${record.status === 'FINAL'
                            ? 'bg-emerald-55 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : record.status === 'ACTIVE'
                              ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                              : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-405 dark:border-slate-500/20'
                          }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenRecord(record)}
                          className="p-1.5 text-slate-400 hover:text-accent dark:hover:text-primary-stitch hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all focus:outline-none"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Daily Meds & Health Timeline */}
        <div className="lg:col-span-4 space-y-6">

          {/* Daily Meds */}
          <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-6 shadow-sm dark:shadow-xl hover-lift duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-on-surface text-base tracking-wide">Daily Meds</h3>
                <p className="text-xs text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Medication routines for today</p>
              </div>
              <span
                onClick={() => setActivePage('reminders')}
                className="bg-red-50 text-red-650 dark:bg-red-500/10 dark:text-red-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider cursor-pointer"
              >
                {filteredMeds.filter(m => !m.isCompleted).length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {filteredMeds.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium">
                  No medication tasks scheduled.
                </div>
              ) : (
                filteredMeds.map((med, index) => (
                  <div
                    key={med.id}
                    className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-surface-container-high border border-slate-150 dark:border-outline-variant/10 p-3.5 rounded-xl hover:border-slate-300 dark:hover:border-outline-variant/30 transition-all border-l-4 border-l-accent dark:border-l-primary-stitch animate-fade-slide-up"
                    style={{ animationDelay: `${(index + 1) * 40}ms` }}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-850 dark:text-on-surface text-sm truncate">{med.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-on-surface-variant font-semibold mt-0.5">{med.dosage}</p>
                      <div className="flex items-center gap-1.5 mt-2 bg-slate-200/50 dark:bg-surface-container-low w-max px-2 py-0.5 rounded text-[10px] font-bold text-slate-550 dark:text-on-surface-variant">
                        <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-on-surface-variant/50" />
                        {med.time}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => toggleMedCompleted(med.id)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all active:scale-95 focus:outline-none ${med.isCompleted
                            ? 'text-white bg-accent border-accent hover:opacity-95'
                            : 'text-slate-400 dark:text-on-surface-variant/75 bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-highest border-transparent'
                          }`}
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Health Timeline */}
          <div className="bg-white dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/10 rounded-2xl p-6 shadow-sm dark:shadow-xl hover-lift duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-on-surface text-base tracking-wide">Health Timeline</h3>
                <p className="text-xs text-slate-400 dark:text-on-surface-variant font-medium mt-0.5">Clinical consultation lifecycle</p>
              </div>
              <Calendar className="h-4.5 w-4.5 text-slate-450 dark:text-on-surface-variant" />
            </div>

            <div className="relative border-l border-slate-200 dark:border-outline-variant/30 ml-2.5 pl-6 space-y-6">
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  No timeline events found.
                </div>
              ) : (
                filteredTimeline.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenTimelineItem(item)}
                    className="relative cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-outline-variant/20 group animate-fade-slide-up"
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                  >
                    <span className="absolute -left-8.5 top-3.5 h-3.5 w-3.5 rounded-full bg-accent dark:bg-primary-stitch border-2 border-white dark:border-surface-container-low z-10 shadow-sm group-hover:scale-125 transition-all"></span>
                    <div>
                      <span className="text-[9px] text-accent dark:text-primary-stitch font-black uppercase tracking-wider block">
                        {item.date}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-on-surface leading-snug mt-0.5 flex items-center gap-1">
                        {item.title}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent dark:text-primary-stitch" />
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-on-surface-variant font-medium mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      {user?.role === 'Patient' && (
        <button
          onClick={() => setShowAddVisit(!showAddVisit)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-xl bg-accent dark:bg-tertiary hover:brightness-110 text-white dark:text-slate-900 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-30 focus:outline-none group"
          title="Log Doctor Visit"
        >
          <Plus className="h-6 w-6 stroke-[3px]" />
          <span className="absolute right-16 bg-white dark:bg-surface-container-highest border border-slate-200 dark:border-outline-variant/30 text-slate-850 dark:text-on-surface px-3 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow">
            Log Doctor Visit
          </span>
        </button>
      )}

      {/* Global Footer matching Stitch */}
      <footer className="w-full py-6 mt-12 border-t border-slate-200 dark:border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider">
        <p>&copy; 2026 HealthVault Secure Systems. HIPAA Compliant.</p>
        <div className="flex gap-6">
          <button
            onClick={() => {
              if (setLegalTab) setLegalTab('privacy');
              setActivePage('legal');
            }}
            className="hover:text-accent dark:hover:text-primary-stitch transition-colors bg-transparent border-0 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              if (setLegalTab) setLegalTab('terms');
              setActivePage('legal');
            }}
            className="hover:text-accent dark:hover:text-primary-stitch transition-colors bg-transparent border-0 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
          >
            Terms of Service
          </button>
          <button
            onClick={() => {
              if (setLegalTab) setLegalTab('security');
              setActivePage('legal');
            }}
            className="hover:text-accent dark:hover:text-primary-stitch transition-colors bg-transparent border-0 cursor-pointer text-[10px] font-bold uppercase tracking-wider"
          >
            Security Standards
          </button>
          <span className="text-red-500 font-extrabold">Emergency: 911</span>
        </div>
      </footer>

      {/* --- POPUPS & MODALS INJECTION --- */}

      {/* 1. Record Detail Modal */}
      {isRecordModalOpen && selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
        />
      )}

      {/* 2. Log Vitals Modal */}
      {showLogVitals && (
        <div className="fixed inset-0 bg-black/60 dark:bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#2D3748]/80 rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#2D3748]/40 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent dark:text-[#E5C282]" />
                Log Vital Parameters
              </h3>
              <button onClick={() => setShowLogVitals(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogVitalsSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  required
                  value={vitalHeartRate}
                  onChange={(e) => setVitalHeartRate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/30 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-[#E5C282] text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    required
                    value={vitalSystolic}
                    onChange={(e) => setVitalSystolic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/30 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-[#E5C282] text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    required
                    value={vitalDiastolic}
                    onChange={(e) => setVitalDiastolic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/30 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-[#E5C282] text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-405 dark:text-slate-500 uppercase block mb-1">Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  min="20"
                  max="600"
                  required
                  value={vitalBloodSugar}
                  onChange={(e) => setVitalBloodSugar(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/30 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent dark:focus:border-[#E5C282] text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2D3748]/40">
                <button
                  type="button"
                  onClick={() => setShowLogVitals(false)}
                  className="bg-slate-100 hover:bg-slate-250 dark:bg-[#2D3748] dark:hover:bg-[#3D4758] text-slate-700 dark:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent dark:bg-[#E5C282] hover:opacity-90 dark:text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Update Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. AI Insight Modal */}
      {showAiInsightModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#2D3748]/80 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#2D3748]/40 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent dark:text-[#E5C282]" />
                Detailed AI Wellness Assessment
              </h3>
              <button onClick={() => setShowAiInsightModal(false)} className="text-slate-400 hover:text-slate-655 dark:hover:text-white font-bold text-sm transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/40 rounded-xl p-4">
                <h4 className="text-xs font-bold text-accent dark:text-[#E5C282] uppercase mb-1.5">Vitals Analysis Summary</h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-350">
                  <li className="flex justify-between border-b border-slate-100 dark:border-[#2D3748]/20 pb-1">
                    <span>Heart Rate:</span>
                    <span className="font-bold">{vitals.heartRate} BPM ({getHeartRateStatus(vitals.heartRate).text})</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 dark:border-[#2D3748]/20 pb-1">
                    <span>Blood Pressure:</span>
                    <span className="font-bold">{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg ({getBPStatus(vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic).text})</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span>Blood Glucose:</span>
                    <span className="font-bold">{vitals.bloodSugar} mg/dL ({getBloodSugarStatus(vitals.bloodSugar).text})</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase border-b border-slate-100 dark:border-[#2D3748]/40 pb-1.5">Primary Insights</h4>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs">
                  <p className="font-bold text-amber-700 dark:text-amber-400 mb-1">Deficiency Alert: Vitamin D</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">Your most recent lab report indicated low Vitamin D levels (18 ng/mL). We recommend at least 15-20 minutes of daily morning sun exposure, and/or consulting with Dr. Sarah Aris regarding Vitamin D3 supplementation.</p>
                </div>

                <div className={`${insights.cardioBgClass} p-3 rounded-lg text-xs border`}>
                  <p className={`font-bold ${insights.cardioTextClass} mb-1`}>{insights.cardioTitle}</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{insights.cardioDesc}</p>
                </div>

                <div className={`${insights.glucoseBgClass} p-3 rounded-lg text-xs border`}>
                  <p className={`font-bold ${insights.glucoseTextClass} mb-1`}>{insights.glucoseTitle}</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{insights.glucoseDesc}</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs">
                  <p className="font-bold text-blue-700 dark:text-blue-400 mb-1">Actionable Lifestyle Steps</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-605 dark:text-slate-300">
                    {insights.lifestyleSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-150 dark:border-[#2D3748]/40 flex justify-end">
              <button
                onClick={() => setShowAiInsightModal(false)}
                className="bg-accent dark:bg-[#E5C282] hover:opacity-90 dark:text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Acknowledge Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Timeline Item Detail Modal */}
      {isTimelineModalOpen && selectedTimelineItem && (
        <div className="fixed inset-0 bg-black/60 dark:bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#161B26] border border-slate-205 dark:border-[#2D3748]/80 rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#2D3748]/40 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent dark:text-[#E5C282]" />
                Timeline Event Details
              </h3>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-on-surface">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-[#E5C282] font-bold uppercase tracking-wider block">Date of Event</span>
                <p className="text-sm font-bold mt-0.5">{selectedTimelineItem.date}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block">Clinical Event / Visit</span>
                <p className="text-base font-extrabold mt-0.5">{selectedTimelineItem.title}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block">Consultation Details</span>
                <p className="text-xs text-slate-650 dark:text-slate-350 font-medium leading-relaxed mt-1.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#2D3748]/30 rounded-xl p-4">
                  {selectedTimelineItem.notes || selectedTimelineItem.subtitle || 'Consultation records fully secured in vault.'}
                </p>
              </div>

              {selectedTimelineItem.diagnosis && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block">Diagnosis</span>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">{selectedTimelineItem.diagnosis}</p>
                </div>
              )}

              {selectedTimelineItem.prescriptions && selectedTimelineItem.prescriptions.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-on-surface-variant font-bold uppercase tracking-wider block">Prescriptions Logged</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedTimelineItem.prescriptions.map((rx, index) => (
                      <span key={index} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-bold px-2 py-0.5 rounded">
                        {rx}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-[#2D3748]/40 flex justify-end">
              <button
                onClick={() => setIsTimelineModalOpen(false)}
                className="bg-accent dark:bg-[#E5C282] hover:opacity-90 dark:text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
