
import React, { useState } from 'react';
import { getRouteSafetyAnalysis } from '../services/geminiService';
import { Location } from '../types';

interface RouteSafetyAnalysisProps {
  currentLocation: Location | null;
}

const RouteSafetyAnalysis: React.FC<RouteSafetyAnalysisProps> = ({ currentLocation }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [analysis, setAnalysis] = useState<{ text: string, groundingChunks: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!origin.trim() || !destination.trim() || !currentLocation) return;
    
    setIsLoading(true);
    setAnalysis(null);
    
    const result = await getRouteSafetyAnalysis(
      origin, 
      destination, 
      currentLocation.lat, 
      currentLocation.lng
    );
    
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Route Safety Analysis</h2>
        <p className="text-slate-500 text-sm">AI-powered checks for your planned journey</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Start location..."
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="End location..."
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !origin.trim() || !destination.trim() || !currentLocation}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing Route...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Run Safety Audit
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="mt-6 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Safety Insights</h3>
              <p className="text-xs text-slate-500">Provided by GuardianAI Gemini</p>
            </div>
          </div>
          
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
            {analysis.text}
          </div>

          {analysis.groundingChunks.length > 0 && (
            <div className="pt-4 border-t border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2">Maps Grounding & Sources</h4>
              <ul className="space-y-2">
                {analysis.groundingChunks.map((chunk, idx) => (
                  <li key={idx}>
                    {chunk.maps?.uri && (
                      <a 
                        href={chunk.maps.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {chunk.maps.title || "View on Google Maps"}
                      </a>
                    )}
                    {chunk.maps?.placeAnswerSources?.reviewSnippets?.map((snippet: any, sIdx: number) => (
                      <p key={sIdx} className="text-[10px] text-slate-500 mt-1 pl-4 italic">"{snippet.text}"</p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RouteSafetyAnalysis;
