'use client';

import React, { useState } from 'react';
import { Sidebar, Header } from '@/components/Layout';
import {
  MetricsRow,
  IntentFeed,
  SystemTerminal,
  RadarProvider,
} from '@/components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldAlert } from 'lucide-react';

const LOCKED_AI_TABS = new Set([
  'ai-chat',
  'ai-vision',
  'ai-voice',
  'ai-video',
  'ai-thinking',
]);

function ModuleLockoutScreen() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass max-w-lg w-full rounded-2xl border border-orange-500/30 shadow-[0_0_60px_rgba(249,115,22,0.12)] p-10 text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center"
          >
            <ShieldAlert className="w-10 h-10 text-red-500" strokeWidth={1.5} />
          </motion.div>
        </div>
        <div className="space-y-4 font-mono text-xs text-zinc-300 leading-relaxed">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-400/95">
            MODULE LOCKED. Operational override engaged.
          </p>
          <p className="text-[11px] text-zinc-400">
            100% of compute power currently routed to Core Radar per client
            specifications.
          </p>
          <p className="text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-4">
            Ecosystem modules will unlock post-deployment.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <span className="h-1 w-8 rounded-full bg-orange-500/40 animate-pulse" />
          <span className="h-1 w-8 rounded-full bg-red-500/30 animate-pulse delay-75" />
          <span className="h-1 w-8 rounded-full bg-orange-500/20 animate-pulse delay-150" />
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('radar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-blue/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main className="lg:ml-64 p-4 lg:p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <RadarProvider>
                <MetricsRow />
                <IntentFeed />
                <SystemTerminal />
              </RadarProvider>
            </motion.div>
          )}

          {LOCKED_AI_TABS.has(activeTab) && (
            <motion.div
              key="locked-ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModuleLockoutScreen />
            </motion.div>
          )}

          {(activeTab === 'swarms' ||
            activeTab === 'webhooks' ||
            activeTab === 'crm' ||
            activeTab === 'settings') && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[600px] glass rounded-xl border border-zinc-800 flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-700 animate-spin" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  Section Under Construction
                </h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  Module: {activeTab.toUpperCase()} | Status: DEPLOYING
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
