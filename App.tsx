
import React, { useState, useRef, useEffect } from 'react';
import { generateBanglaSpeech } from './services/geminiService';
import { decodeBase64, createWavFile } from './audioUtils';
import { VoiceName, VoiceOption, AudioGenerationState } from './types';

const VOICE_OPTIONS: VoiceOption[] = [
  { id: VoiceName.Kore, label: 'Kore (গম্ভীর)', description: 'পেশাদার এবং গভীর কণ্ঠস্বর।' },
  { id: VoiceName.Zephyr, label: 'Zephyr (সাবলীল)', description: 'পরিষ্কার এবং প্রাণবন্ত উচ্চারণ।' },
  { id: VoiceName.Puck, label: 'Puck (বন্ধুসুলভ)', description: 'কোমল এবং মিষ্টি কণ্ঠস্বর।' },
];

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [state, setState] = useState<AudioGenerationState>({
    isLoading: false,
    error: null,
    audioUrl: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => {
        setInstallPrompt(null);
      });
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setState(prev => ({ ...prev, error: "অনুগ্রহ করে রূপান্তর করার জন্য কিছু টেক্সট লিখুন।" }));
      return;
    }

    setState({ isLoading: true, error: null, audioUrl: null });

    try {
      const base64Data = await generateBanglaSpeech(text, selectedVoice);
      const pcmBytes = decodeBase64(base64Data);
      const wavBlob = createWavFile(pcmBytes);
      const url = URL.createObjectURL(wavBlob);
      
      setState({
        isLoading: false,
        error: null,
        audioUrl: url,
      });

      // Auto-play attempt
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Playback started manually"));
        }
      }, 300);

    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message || "একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        audioUrl: null,
      });
    }
  };

  const handleDownload = () => {
    if (state.audioUrl) {
      const link = document.createElement('a');
      link.href = state.audioUrl;
      link.download = `bangla-voice-pro-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 sm:py-12 bg-slate-50">
      {/* PWA Prompt */}
      {installPrompt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md bg-white border border-indigo-100 p-4 rounded-2xl shadow-2xl flex items-center justify-between bn-font animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             </div>
             <span className="font-bold text-sm text-gray-800 leading-tight">ভালো অভিজ্ঞতার জন্য অ্যাপটি ইনস্টল করুন!</span>
          </div>
          <button onClick={handleInstallClick} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">ইনস্টল</button>
        </div>
      )}

      {/* Header */}
      <header className="max-w-3xl w-full text-center mb-10">
        <div className="inline-block p-2 bg-indigo-100 rounded-full mb-4">
           <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl mb-3 bn-font">
          BanglaVoice <span className="text-indigo-600">Pro</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto bn-font">
          একদম মানুষের মতো প্রাণবন্ত বাংলা কণ্ঠস্বর তৈরি করুন কয়েক সেকেন্ডের মধ্যেই।
        </p>
      </header>

      {/* Main UI */}
      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Card */}
        <section className="lg:col-span-8">
          <div className="app-card p-6 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8 3a3 3 0 100-6 3 3 0 000 6z"></path></svg>
            </div>
            
            <label htmlFor="text-input" className="block text-sm font-bold text-slate-700 mb-4 bn-font uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              আপনার টেক্সট এখানে লিখুন
            </label>
            
            <textarea
              id="text-input"
              rows={12}
              className="block w-full rounded-2xl border-slate-200 border p-6 text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-lg bn-font resize-none bg-slate-50/30 transition-all placeholder:text-slate-300"
              placeholder="আপনি যে বাক্যটি শুনতে চান তা এখানে টাইপ করুন..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 bn-font uppercase">
                  {text.length} অক্ষর
                </span>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={state.isLoading || !text.trim()}
                className={`group flex items-center justify-center px-12 py-5 border border-transparent text-xl font-black rounded-2xl text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${
                  state.isLoading || !text.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-1'
                }`}
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="bn-font">তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span className="bn-font">অডিও তৈরি করুন</span>
                    <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {state.error && (
            <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center animate-bounce-short">
              <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800 bn-font font-bold">{state.error}</p>
            </div>
          )}
        </section>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Voice Picker */}
          <div className="app-card p-6 border border-slate-100">
            <h3 className="text-md font-black text-slate-800 mb-6 bn-font flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              ভয়েস পরিবর্তন করুন
            </h3>
            <div className="space-y-4">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
                    selectedVoice === voice.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-50'
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className={`font-black text-lg bn-font ${selectedVoice === voice.id ? 'text-indigo-700' : 'text-slate-700'}`}>{voice.label}</span>
                    <p className="text-xs text-slate-400 mt-0.5 bn-font font-medium">{voice.description}</p>
                  </div>
                  {selectedVoice === voice.id && (
                    <div className="bg-indigo-600 p-1.5 rounded-full text-white">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Player Controls */}
          <div className={`app-card p-6 border border-slate-100 transition-all duration-700 transform ${state.audioUrl ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-8 pointer-events-none'}`}>
            <h3 className="text-md font-black text-slate-800 mb-6 bn-font flex items-center gap-2 uppercase tracking-tighter">
               <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
               প্রিভিউ এবং ডাউনলোড
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <audio 
                ref={audioRef}
                src={state.audioUrl || ''} 
                controls 
                className="w-full h-10"
              />
            </div>
            
            <button
              onClick={handleDownload}
              disabled={!state.audioUrl}
              className="w-full flex items-center justify-center px-6 py-5 border border-transparent text-lg font-black rounded-2xl text-white bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95 group"
            >
              <svg className="mr-3 h-6 w-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="bn-font">অডিও ফাইল ডাউনলোড</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Trust Badges */}
      <section className="max-w-6xl w-full mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center group">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 transform group-hover:rotate-6 transition-transform">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h4 className="font-black text-slate-900 bn-font text-xl mb-3">সাবলীল কণ্ঠস্বর</h4>
          <p className="text-slate-500 bn-font text-sm leading-relaxed">অত্যাধুনিক নিউরাল ইঞ্জিন ব্যবহার করে কোনো যান্ত্রিক অনুভূতি ছাড়াই মানুষের মতো অডিও তৈরি হয়।</p>
        </div>
        <div className="text-center group">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6 transform group-hover:-rotate-6 transition-transform">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h4 className="font-black text-slate-900 bn-font text-xl mb-3">সম্পূর্ণ নিরাপদ</h4>
          <p className="text-slate-500 bn-font text-sm leading-relaxed">আপনার অডিও এবং ডেটা এন্ড-টু-এন্ড এনক্রিপশনের মাধ্যমে সুরক্ষিত থাকে এবং কারো সাথে শেয়ার করা হয় না।</p>
        </div>
        <div className="text-center group">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto mb-6 transform group-hover:scale-110 transition-transform">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h4 className="font-black text-slate-900 bn-font text-xl mb-3">বিদ্যুৎ গতি</h4>
          <p className="text-slate-500 bn-font text-sm leading-relaxed">আপনার দীর্ঘ টেক্সট থেকে হাই-কোয়ালিটি অডিও ফাইল তৈরি হতে সময় নেয় মাত্র কয়েক সেকেন্ড।</p>
        </div>
      </section>

      <footer className="mt-28 mb-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] bn-font flex items-center gap-4">
        <div className="h-px w-12 bg-slate-200"></div>
        &copy; {new Date().getFullYear()} BanglaVoice Pro AI Engine
        <div className="h-px w-12 bg-slate-200"></div>
      </footer>
    </div>
  );
};

export default App;
