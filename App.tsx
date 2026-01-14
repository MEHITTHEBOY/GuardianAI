
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import SafetyMap from './components/SafetyMap';
import GenAIAssistant from './components/GenAIAssistant';
import RouteSafetyAnalysis from './components/RouteSafetyAnalysis';
import CommunitySafety from './components/CommunitySafety';
import { SafetyStatus, Location, EmergencyContact } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MOCK_STATS = [
  { name: 'Mon', incidents: 2 },
  { name: 'Tue', incidents: 0 },
  { name: 'Wed', incidents: 1 },
  { name: 'Thu', incidents: 3 },
  { name: 'Fri', incidents: 5 },
  { name: 'Sat', incidents: 4 },
  { name: 'Sun', incidents: 1 },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<SafetyStatus>(SafetyStatus.SAFE);
  const [location, setLocation] = useState<Location | null>(null);
  const [contacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Mom', phone: '+1 234 567 8901', relation: 'Family' },
    { id: '2', name: 'Sarah', phone: '+1 987 654 3210', relation: 'Friend' },
  ]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const triggerSOS = useCallback(() => {
    setStatus(SafetyStatus.DANGER);
    // In a real app, this would send SMS/Notifications to backend
    console.log("SOS TRIGGERED! Sent coordinates to contacts:", location);
  }, [location]);

  const cancelSOS = useCallback(() => {
    setStatus(SafetyStatus.SAFE);
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-40">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Status, Map & Route Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Safety Dashboard</h1>
                  <p className="text-slate-500 text-sm">Real-time status and active protection</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
                  status === SafetyStatus.DANGER 
                    ? 'bg-red-100 text-red-700 animate-pulse' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${status === SafetyStatus.DANGER ? 'bg-red-600' : 'bg-emerald-600'}`} />
                  {status === SafetyStatus.DANGER ? 'EMERGENCY ACTIVE' : 'SYSTEMS SECURE'}
                </div>
              </div>

              <SafetyMap location={location} status={status} />

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-xs uppercase font-bold mb-1">Signal</div>
                  <div className="text-lg font-bold text-slate-800">Excellent</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-xs uppercase font-bold mb-1">Battery</div>
                  <div className="text-lg font-bold text-slate-800">82%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-xs uppercase font-bold mb-1">Contacts</div>
                  <div className="text-lg font-bold text-slate-800">{contacts.length} Active</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-xs uppercase font-bold mb-1">Encryption</div>
                  <div className="text-lg font-bold text-slate-800">AES-256</div>
                </div>
              </div>
            </section>

            <RouteSafetyAnalysis currentLocation={location} />
            <CommunitySafety currentLocation={location} />

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Area Safety Index (Weekly)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_STATS}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="incidents" radius={[6, 6, 6, 6]} barSize={32}>
                      {MOCK_STATS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.incidents > 3 ? '#ef4444' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Right Column: Contacts & AI Assistant */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Emergency Contacts</h2>
                <button className="text-indigo-600 font-semibold text-sm hover:underline">Edit</button>
              </div>
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{c.relation}</p>
                      </div>
                    </div>
                    <a href={`tel:${c.phone}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </a>
                  </div>
                ))}
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium hover:border-indigo-300 hover:text-indigo-500 transition-all">
                  + Add New Contact
                </button>
              </div>
            </section>

            <GenAIAssistant />
          </div>

        </div>
      </main>

      <SOSButton 
        onTrigger={triggerSOS} 
        onCancel={cancelSOS} 
        isTriggered={status === SafetyStatus.DANGER} 
      />
    </div>
  );
};

export default App;
