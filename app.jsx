import React, { useState, useEffect } from 'react';
import { Send, Globe, Download, Share2, ArrowLeft, Loader2, FileText, Music, Video, Image as ImageIcon, Sparkles } from 'lucide-react';

// --- CONFIGURATION ---
// The execution environment provides the key at runtime.
const apiKey = ""; 

const App = () => {
  const [view, setView] = useState('welcome'); 
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const appId = typeof __app_id !== 'undefined' ? __app_id : 'ive-got-an-idea';

  // --- API HELPER WITH EXPONENTIAL BACKOFF ---
  const callGemini = async (prompt, systemInstruction, retries = 5, delay = 1000) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  };

  // --- THE MULTI-AGENT DEBATE LOGIC ---
  const startSpark = async () => {
    if (!idea.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // STEP 1: THE REALIST
      setStatus("Agent 1 (The Realist) is grounding the idea...");
      const realistSystem = "You are a pragmatic, logic-driven business consultant. Analyze the user's idea and provide a grounded, feasible structured breakdown. Output JSON: { feasibility: string, structure: string }";
      const realistAnalysis = await callGemini(idea, realistSystem);

      // STEP 2: THE CHAOS ARTIST
      setStatus("Agent 2 (The Chaos Artist) is adding extreme wacky energy...");
      const chaosSystem = "You are a wild, avant-garde artist who hates the status quo. Take the user's idea and inject it with 'ridiculous' energy and abstract flair. Output JSON: { wacky_elements: string, abstract_twist: string }";
      const chaosAnalysis = await callGemini(idea, chaosSystem);

      // STEP 3: THE JUDGE (SYNTHESIZER)
      setStatus("The Judge is synthesizing the final vision...");
      const judgeSystem = `You are The Judge. You have the Realist's logic: ${JSON.stringify(realistAnalysis)} and the Chaos Artist's flair: ${JSON.stringify(chaosAnalysis)}. 
      Your job is to balance them (60% chaos, 40% realist) into a final asset. 
      Decide the category: POSTER, SCRIPT, MUSICAL, or BUSINESS_PLAN.
      Output JSON schema: { category: string, title: string, content: string, realist_note: string, chaos_note: string }`;
      
      const finalActualization = await callGemini(`Original Idea: ${idea}`, judgeSystem);

      setResult({
        ...finalActualization,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", // Placeholder for now
        details: {
          realist_note: finalActualization.realist_note,
          chaos_note: finalActualization.chaos_note
        }
      });
      setView('results');
    } catch (err) {
      setError("The agents couldn't agree on a vision. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- LOGO ICON ---
  const LogoIcon = () => (
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
      <path d="M35 110C35 100 45 95 60 95H140C155 95 165 100 165 110V140H35V110Z" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 140H165M100 140V110M65 140V115M135 140V115" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M30 140H170V160C170 165 165 168 160 168H40C35 168 30 165 30 160V140Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 140C20 140 15 130 15 120V110C15 105 20 105 25 105H35" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M165 105H175C180 105 185 105 185 110V120C185 130 180 140 170 140" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="70" r="18" stroke="white" strokeWidth="2.5" fill="#020617" />
      <circle cx="93" cy="68" r="1.5" fill="white" />
      <circle cx="107" cy="68" r="1.5" fill="white" />
      <path d="M95 78C95 78 98 81 105 78" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M100 88V95" stroke="white" strokeWidth="2" />
      <path d="M75 105C65 120 65 145 100 145C135 145 135 120 125 105" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="#020617" />
      <path d="M85 145C85 145 90 152 100 152C110 152 115 145 115 145" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M98 128V132" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M72 110C65 115 60 130 80 135" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M128 110C135 115 140 130 120 135" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M145 140L160 138L168 155L142 158L145 140Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="152" cy="132" r="1.5" fill="#22d3ee" className="animate-pulse" />
      <path d="M115 45C115 45 110 55 105 60M115 45C115 30 135 22 155 22C175 22 188 32 188 45C188 58 175 68 155 68C145 68 138 65 132 62L120 70V58C117 55 115 50 115 45Z" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <text x="128" y="48" fill="white" fontSize="7" fontWeight="900" fontFamily="monospace">ive got an idea</text>
    </svg>
  );

  // --- VIEWS ---

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 text-white">
      <div className="relative mb-2">
        <div className="absolute inset-0 bg-cyan-500 blur-[100px] opacity-20 animate-pulse"></div>
        <LogoIcon />
      </div>
      <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent uppercase">
        IVE GOT AN IDEA
      </h1>
      <p className="text-slate-400 mb-12 max-w-xs text-lg italic">
        "It literally just came to me..."
      </p>
      
      <button 
        onClick={() => setView('input')}
        className="group relative w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl mb-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2 text-xl tracking-tighter uppercase">
          Start Creating 
          <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform"></div>
      </button>

      <button className="text-slate-500 font-medium flex items-center gap-2 hover:text-white transition-colors group mt-2">
        <Globe size={18} className="group-hover:rotate-12 transition-transform" /> View Global Gallery
      </button>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );

  const InputLaboratory = () => (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
      <button onClick={() => setView('welcome')} className="text-slate-400 mb-8 self-start p-2 hover:bg-slate-900 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">The Lab</h2>
      <p className="text-slate-500 mb-8">What's the idea?</p>
      
      <textarea 
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="e.g. A musical about a man who never leaves his couch..."
        className="flex-1 bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 text-white text-lg focus:outline-none focus:border-cyan-500 transition-all resize-none placeholder:text-slate-700 shadow-inner"
      />

      <div className="mt-8">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="text-cyan-400 animate-spin" size={40} />
            <p className="text-cyan-400 font-medium animate-pulse text-center px-4">{status}</p>
          </div>
        ) : (
          <button 
            onClick={startSpark}
            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-lg"
          >
            Actualize
          </button>
        )}
        {error && <p className="text-red-500 text-center mt-4 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );

  const ResultsReveal = () => (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
       <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => setView('input')} className="text-slate-400 p-2 hover:bg-slate-900 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold tracking-widest text-[10px] uppercase text-slate-500">Result Actualized</span>
          <div className="w-10"></div>
       </div>

       <div className="p-6 max-w-2xl mx-auto">
          <div className="rounded-3xl overflow-hidden mb-6 border-2 border-slate-800 bg-slate-900 shadow-2xl relative">
             <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>
             {result?.category === 'POSTER' && (
               <img src={result.imageUrl} alt="Result" className="w-full h-96 object-cover" />
             )}
             {result?.category !== 'POSTER' && (
               <div className="p-16 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/20">
                    <Sparkles size={40} className="text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter">{result?.category} Generated</h3>
                  <p className="text-slate-400">Content synthesized and ready.</p>
               </div>
             )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
               <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-500/20">
                 {result?.category}
               </span>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{result?.title}</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">{result?.content}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 bg-slate-900/40 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div>
                    <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">The Realist</p>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-snug">{result?.details?.realist_note}</p>
               </div>
               <div className="p-5 bg-slate-900/40 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_purple]"></div>
                    <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Chaos Energy</p>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-snug">{result?.details?.chaos_note}</p>
               </div>
            </div>
          </div>
       </div>

       <div className="fixed bottom-8 left-6 right-6 flex gap-3 max-w-md mx-auto z-30">
          <button className="flex-1 py-4 bg-slate-900 border-2 border-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg">
            <Download size={18} /> Download
          </button>
          <button className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
            <Share2 size={18} /> Publish
          </button>
       </div>
    </div>
  );

  switch(view) {
    case 'input': return <InputLaboratory />;
    case 'results': return <ResultsReveal />;
    default: return <WelcomeScreen />;
  }
};

export default App;