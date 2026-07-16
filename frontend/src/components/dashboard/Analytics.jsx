import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const Analytics = () => {
  // Static high-fidelity timeline data matching the user's clinical record updates
  const vitalsData = [
    { month: 'Jan', systolic: 138, diastolic: 88, bloodSugar: 142, cholesterol: 248 },
    { month: 'Feb', systolic: 135, diastolic: 86, bloodSugar: 138, cholesterol: 244 },
    { month: 'Mar', systolic: 132, diastolic: 84, bloodSugar: 139, cholesterol: 242 },
    { month: 'Apr', systolic: 130, diastolic: 82, bloodSugar: 135, cholesterol: 240 },
    { month: 'May', systolic: 126, diastolic: 80, bloodSugar: 130, cholesterol: 238 },
    { month: 'Jun', systolic: 120, diastolic: 78, bloodSugar: 126, cholesterol: 228 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Blood Pressure & Cholesterol Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Blood Pressure & Lipids Trend</h3>
            <p className="text-xs text-slate-400 font-medium">Monthly clinical measurements</p>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-100">
            Improving
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[60, 260]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', border: 'none' }}
                labelStyle={{ fontWeight: 'bold', color: '#14B8A6' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
              <Line 
                name="Systolic BP" 
                type="monotone" 
                dataKey="systolic" 
                stroke="#E11D48" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                name="Diastolic BP" 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#F43F5E" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={{ r: 3 }} 
              />
              <Line 
                name="Total Cholesterol" 
                type="monotone" 
                dataKey="cholesterol" 
                stroke="#14B8A6" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Glucose Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Fasting Blood Glucose levels</h3>
            <p className="text-xs text-slate-400 font-medium">Daily average (mg/dL)</p>
          </div>
          <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded border border-amber-100">
            Borderline Diabetic
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vitalsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 180]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', border: 'none' }}
                labelStyle={{ fontWeight: 'bold', color: '#14B8A6' }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
              <Bar 
                name="Fasting Glucose (mg/dL)" 
                dataKey="bloodSugar" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
