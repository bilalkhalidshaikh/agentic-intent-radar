'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Loader2, 
  Video, 
  Upload, 
  X, 
  Zap, 
  Volume2, 
  Activity,
  MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Voice Core (Mock Live API) ---
export const VoiceCore = () => {
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const sessionRef = useRef<any>(null);

  const startLiveSession = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsLive(true);
      setIsConnecting(false);
      setTranscript(prev => [...prev, "[SYSTEM] Voice link established.", "AI: Tactical voice core active. How can I assist your swarm today?"]);
    }, 1500);
  };

  const stopLiveSession = () => {
    setIsLive(false);
    setTranscript(prev => [...prev, "[SYSTEM] Voice link severed."]);
  };

  return (
    <div className="glass rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-[450px] lg:h-[500px]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-brand-blue" />
          <span className="text-xs font-bold uppercase tracking-widest">Voice Core Interface</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isLive ? 'text-green-500' : 'text-zinc-500'}`}>
            {isLive ? 'Live' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={isLive ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-brand-blue/20 rounded-full blur-3xl -z-10"
          />
          <button 
            onClick={isLive ? stopLiveSession : startLiveSession}
            disabled={isConnecting}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              isLive 
                ? 'bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'bg-brand-blue/20 border-2 border-brand-blue text-brand-blue shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105'
            }`}
          >
            {isConnecting ? <Loader2 className="w-8 h-8 animate-spin" /> : isLive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-4">
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i}
                animate={isLive ? { height: [8, (i % 3 + 1) * 15, 8] } : { height: 8 }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-1.5 bg-brand-blue/50 rounded-full"
              />
            ))}
          </div>
          <p className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {isLive ? 'Listening for input...' : 'Click to establish voice link'}
          </p>
        </div>

        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 h-32 overflow-y-auto font-mono text-[10px] text-zinc-500 space-y-1 custom-scrollbar">
          {transcript.map((line, i) => (
            <div key={i} className={line.startsWith('[SYSTEM]') ? 'text-zinc-600' : 'text-zinc-400'}>{line}</div>
          ))}
          {transcript.length === 0 && <div className="text-zinc-800 italic">No activity logs...</div>}
        </div>
      </div>
    </div>
  );
};

// --- Video Forge (Mock Veo) ---
export const VideoForge = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setStatus('Initializing Veo Engine...');
    
    setTimeout(() => setStatus('Rendering Frames...'), 1000);
    setTimeout(() => setStatus('Finalizing Asset...'), 3000);
    
    setTimeout(() => {
      setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
      setIsGenerating(false);
      setStatus('Generation Complete.');
    }, 5000);
  };

  return (
    <div className="glass rounded-xl border border-zinc-800 overflow-hidden flex flex-col h-auto lg:h-[600px]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest">Video Forge Engine</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Video Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the cinematic sequence..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-orange h-32 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reference Image (Optional)</label>
              <div className="aspect-video bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                {image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" alt="Reference" />
                    <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-red-500/50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-zinc-700 group-hover:text-brand-orange transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Upload Frame</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Output Preview</label>
            <div className="aspect-video bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-contain" />
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
                  <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest animate-pulse">{status}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <MonitorPlay className="w-12 h-12 text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Generation</span>
                </div>
              )}
            </div>
            <button 
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
              className="w-full py-4 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold uppercase tracking-widest hover:bg-brand-orange/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Ignite Forge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
