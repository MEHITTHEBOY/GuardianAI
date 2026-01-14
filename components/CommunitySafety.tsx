import React, { useState, useEffect, useRef } from 'react';
import { ReportType, CommunityReport, Location } from '../types';
import { summarizeIncident } from '../services/geminiService';
import L from 'leaflet';

interface CommunitySafetyProps {
  currentLocation: Location | null;
}

const MOCK_REPORTS: CommunityReport[] = [
  {
    id: 'r1',
    type: ReportType.INCIDENT,
    lat: 37.7749,
    lng: -122.4194,
    title: 'Suspicious Activity',
    description: 'Poor lighting in the alleyway behind Main St. Multiple reports of unsolicited follows in this area after 10 PM. Please use the main road instead.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    urgency: 'Medium'
  },
  {
    id: 'r2',
    type: ReportType.SAFE_ZONE,
    lat: 37.7833,
    lng: -122.4167,
    title: 'Safe Haven: 24/7 Pharmacy',
    description: 'Well-lit area with security and friendly staff. Highly recommended for waiting for transport or taking a break. Always has people around.',
    timestamp: new Date(Date.now() - 86400000),
  }
];

const CommunitySafety: React.FC<CommunitySafetyProps> = ({ currentLocation }) => {
  const [reports, setReports] = useState<CommunityReport[]>(MOCK_REPORTS);
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState<ReportType>(ReportType.INCIDENT);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        attributionControl: false
      }).setView([currentLocation?.lat || 37.7749, currentLocation?.lng || -122.4194], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current && markersLayer.current) {
      markersLayer.current.clearLayers();

      reports.forEach(report => {
        const marker = L.circleMarker([report.lat, report.lng], {
          radius: 8,
          fillColor: report.type === ReportType.INCIDENT ? '#ef4444' : '#10b981',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(markersLayer.current!);

        marker.on('click', () => setSelectedReport(report));
      });

      if (currentLocation) {
        // Center on user but don't force zoom every time reports update
        // mapInstance.current.setView([currentLocation.lat, currentLocation.lng]);
      }
    }
  }, [reports, currentLocation]);

  const handleReportSubmit = async () => {
    if (!description.trim() || !currentLocation) return;
    setIsSubmitting(true);

    let finalTitle = reportType === ReportType.INCIDENT ? "Incident Reported" : "Safe Zone Marked";
    let finalSummary = description;
    let urgency: any = 'Low';

    if (reportType === ReportType.INCIDENT) {
      const summaryResult = await summarizeIncident(description);
      if (summaryResult) {
        finalTitle = summaryResult.title;
        finalSummary = summaryResult.summary;
        urgency = summaryResult.urgency;
      }
    }

    const newReport: CommunityReport = {
      id: Date.now().toString(),
      type: reportType,
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.005, 
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.005,
      title: finalTitle,
      description: finalSummary,
      timestamp: new Date(),
      urgency
    };

    setReports([newReport, ...reports]);
    setDescription('');
    setIsReporting(false);
    setIsSubmitting(false);
  };

  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Community Safety Map</h2>
          <p className="text-slate-500 text-sm">Anonymous reports from women in your area</p>
        </div>
        <button 
          onClick={() => setIsReporting(!isReporting)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
        >
          {isReporting ? 'Cancel' : 'Report Something'}
          <svg className={`w-4 h-4 transition-transform ${isReporting ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {isReporting && (
        <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setReportType(ReportType.INCIDENT)}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${reportType === ReportType.INCIDENT ? 'bg-red-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Report Incident
            </button>
            <button 
              onClick={() => setReportType(ReportType.SAFE_ZONE)}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${reportType === ReportType.SAFE_ZONE ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Mark Safe Zone
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={reportType === ReportType.INCIDENT ? "Describe what happened (Gemini will summarize this anonymously)..." : "Why is this area safe? (e.g. good lighting, 24/7 security)"}
            className="w-full h-24 p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm mb-4"
          />
          <button
            onClick={handleReportSubmit}
            disabled={isSubmitting || !description.trim() || !currentLocation}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all"
          >
            {isSubmitting ? 'Processing with AI...' : 'Submit Anonymous Report'}
          </button>
        </div>
      )}

      <div className="relative h-80 rounded-2xl overflow-hidden border border-slate-200 mb-6 group">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Selected Report Modal/Popover Overlay */}
        {selectedReport && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className={`px-5 py-3 flex items-center justify-between ${
                selectedReport.type === ReportType.INCIDENT ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedReport.type === ReportType.INCIDENT ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedReport.type === ReportType.INCIDENT ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    {selectedReport.type}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedReport.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                    <span>{selectedReport.timestamp.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedReport.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {selectedReport.urgency && (
                      <>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          selectedReport.urgency === 'High' ? 'bg-red-100 text-red-600' :
                          selectedReport.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {selectedReport.urgency} Priority
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {selectedReport.description}
                </p>

                <div className="mt-5 flex gap-2">
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-slate-600 border border-slate-200 z-[500]">
          Interactive Safety Map
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Recent Community Updates</h3>
        {reports.slice(0, 3).map((report) => (
          <div 
            key={report.id} 
            onClick={() => {
              setSelectedReport(report);
              mapInstance.current?.panTo([report.lat, report.lng]);
            }}
            className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${report.type === ReportType.INCIDENT ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {report.type === ReportType.INCIDENT ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="font-bold text-slate-800 text-sm truncate">{report.title}</h4>
                <span className="text-[10px] text-slate-400">{report.timestamp.toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{report.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommunitySafety;