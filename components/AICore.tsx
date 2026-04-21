'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Mic, 
  MicOff, 
  Play, 
  Square,
  Video,
  BrainCircuit,
  Search,
  MapPin,
  Maximize2,
  Minimize2,
  MessageSquare,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- AI Strategist (Chat) ---
export const GeminiChat = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Mock Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'model', text: "Tactical analysis complete. Based on current swarm parameters, I recommend increasing Facebook polling frequency in the Boca Raton sector. Intent signals are peaking in the residential roofing category." }]);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex flex-col h-[500px] lg:h-[600px] glass rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-blue" />
          <span className="text-xs font-bold uppercase tracking-widest">AI Strategist Core</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12 text-brand-blue" />
            <p className="text-xs font-medium uppercase tracking-widest">Awaiting tactical input...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-brand-orange/20 border border-brand-orange/30" : "bg-brand-blue/20 border border-brand-blue/30"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-brand-orange" /> : <Bot className="w-4 h-4 text-brand-blue" />}
            </div>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm",
              msg.role === 'user' ? "bg-zinc-800 text-zinc-100 rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
            )}>
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-brand-blue/50 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-brand-blue/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-brand-blue/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI Strategist..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-blue transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Vision Lab (Image Analysis & Generation) ---
export const VisionLab = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || isAnalyzing) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis("### Signal Analysis Report\n\n**Prospect:** Sarah Miller\n**Intent Score:** 98/100\n**Context:** Urgent roofing repair request in Boca Raton. High conversion probability.");
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedImage("https://picsum.photos/seed/creative/800/800");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image Analysis */}
      <div className="glass rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-widest">Signal Vision Analyzer</span>
          </div>
        </div>
        <div className="p-6 flex-1 space-y-6">
          <div className="aspect-video bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
            {image ? (
              <>
                <img src={image} className="w-full h-full object-contain" alt="Upload" />
                <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-red-500/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-zinc-700 group-hover:text-brand-orange transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Upload Signal Screenshot</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            )}
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="w-full py-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold uppercase tracking-widest hover:bg-brand-orange/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Intent Signal
          </button>
          {analysis && (
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-400">
              <div className="markdown-body">
                <Markdown>{analysis}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Generation */}
      <div className="glass rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-blue" />
            <span className="text-xs font-bold uppercase tracking-widest">Creative Asset Forge</span>
          </div>
        </div>
        <div className="p-6 flex-1 space-y-6">
          <div className="space-y-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the ad creative or asset to generate..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-brand-blue h-24 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aspect Ratio</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-blue"
                >
                  {['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resolution</label>
                <select 
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-blue"
                >
                  {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold uppercase tracking-widest hover:bg-brand-blue/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Forge Asset
          </button>
          {generatedImage && (
            <div className="aspect-square bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <img src={generatedImage} className="w-full h-full object-cover" alt="Generated" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Deep Think (Reasoning) ---
export const DeepThink = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleThink = async () => {
    if (!query || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setResult("### Strategic Optimization Protocol\n\n1. **Channel Diversification:** Shift 15% of budget to Reddit local subreddits.\n2. **Lead Routing:** Implement AI-first triage to prioritize 'Emergency' keywords.\n3. **Agent Allocation:** Scale Boca Raton team by 2 units to handle peak evening demand.");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="glass rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Deep Reasoning Core</span>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complex Strategic Query</label>
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a complex scenario for deep analysis (e.g., 'Optimize multi-channel lead routing for a $1M/mo agency with 50 agents')..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 h-32 resize-none transition-all"
          />
        </div>
        <button 
          onClick={handleThink}
          disabled={!query || isLoading}
          className="w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 font-bold uppercase tracking-widest hover:bg-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
          Execute Deep Reasoning
        </button>
        {result && (
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-400 leading-relaxed">
            <div className="markdown-body">
              <Markdown>{result}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
