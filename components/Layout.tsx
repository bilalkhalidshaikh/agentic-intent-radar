'use client';

import React from 'react';
import { 
  Radar, 
  Users, 
  Webhook, 
  RefreshCw, 
  Settings, 
  ChevronRight,
  Zap,
  ShieldAlert,
  Activity,
  Bell,
  User,
  Search,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Mic,
  BrainCircuit,
  LogOut,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = ({ 
  activeTab, 
  setActiveTab,
  isOpen,
  setIsOpen
}: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  const navItems: Array<{
    id: string;
    label: string;
    icon: typeof Radar;
    locked?: boolean;
  }> = [
    { id: 'radar', label: 'Live Radar', icon: Radar },
    { id: 'swarms', label: 'Campaign Swarms', icon: Users },
    { id: 'webhooks', label: 'Webhook Routing', icon: Webhook },
    { id: 'crm', label: 'CRM Sync', icon: RefreshCw },
    { id: 'ai-chat', label: 'AI Strategist', icon: MessageSquare, locked: true },
    { id: 'ai-vision', label: 'Vision Lab', icon: ImageIcon, locked: true },
    { id: 'ai-voice', label: 'Voice Core', icon: Mic, locked: true },
    { id: 'ai-video', label: 'Video Forge', icon: Video, locked: true },
    { id: 'ai-thinking', label: 'Deep Think', icon: BrainCircuit, locked: true },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed left-0 top-0 h-screen glass border-r border-zinc-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-orange to-brand-blue flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase">
              <span className="text-brand-orange">Achroweb</span>
              <span className="text-zinc-400 mx-1">:</span>
              <span className="text-brand-blue">Sniper</span>
            </h1> */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0">
  <img src="/logo.png" alt="Achroweb" className="w-full h-full object-cover" />
</div>
<h1 className="text-sm font-black tracking-tighter uppercase">
  <span className="text-brand-orange">Achroweb</span>
  <span className="text-zinc-400 mx-1">:</span>
  <span className="text-brand-blue">Sniper</span>
</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const lockedActive = Boolean(item.locked && isActive);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive && !item.locked
                    ? "text-brand-blue bg-brand-blue/10 border-l-2 border-brand-blue"
                    : lockedActive
                      ? "text-orange-400 bg-orange-500/10 border-l-2 border-orange-500/80"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  lockedActive
                    ? "text-orange-400"
                    : isActive
                      ? "text-brand-blue"
                      : "text-zinc-500 group-hover:text-zinc-300"
                )} />
                <span className="flex-1 text-left flex items-center gap-2 min-w-0">
                  {item.label}
                  {item.locked && (
                    <Lock className="w-3 h-3 text-red-500 shrink-0" aria-hidden />
                  )}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-glow"
                    className={cn(
                      "absolute inset-0 blur-md -z-10",
                      item.locked ? "bg-orange-500/10" : "bg-brand-blue/5"
                    )}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Operator_01</p>
              <p className="text-[10px] text-zinc-500 truncate">itsbilaldev@gmail.com</p>
            </div>
            <button className="text-zinc-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="h-16 glass border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 lg:ml-64">
      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse neon-green-glow" />
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Swarm Online</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700">
          <Activity className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">24ms</span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-brand-blue transition-colors w-32 lg:w-64"
          />
        </div>
        
        <button className="p-2 rounded-lg hover:bg-zinc-800 transition-colors relative">
          <Bell className="w-4 h-4 text-zinc-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-zinc-950" />
        </button>
        
        <div className="h-8 w-[1px] bg-zinc-800 mx-1 lg:mx-2" />
        
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/20 transition-all group">
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden xs:inline text-xs font-bold uppercase tracking-wider">Deploy</span>
        </button>
      </div>
    </header>
  );
};
