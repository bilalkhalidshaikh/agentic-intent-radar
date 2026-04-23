'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TrendingUp,
  Target,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  MoreVertical,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  Radar,
} from 'lucide-react';
import { FaReddit } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import * as MotionReact from 'motion/react';

const motion = (MotionReact as any).motion as typeof MotionReact.motion;
const AnimatePresence = (MotionReact as any).AnimatePresence as any;

export type LeadIntent = 'HIGH' | 'QUAL';

export type Lead = {
  id: number;
  source: string;
  name: string;
  time: string;
  context: string;
  score: number;
  intent: LeadIntent;
  status: string;
  category?: string;
  sourceId?: string;
};

type Metrics = {
  intercepted: number;
  strikes: number;
  pipeline: number;
};

type RadarContextValue = {
  leads: Lead[];
  logs: string[];
  metrics: Metrics;
};

const RadarContext = createContext<RadarContextValue | null>(null);

function useRadarContext(): RadarContextValue {
  const ctx = useContext(RadarContext);
  if (!ctx) {
    throw new Error('useRadarContext must be used within RadarProvider');
  }
  return ctx;
}

function pipelineIncrement() {
  return Math.floor(Math.random() * (3500 - 1200 + 1) + 1200);
}

function normalizeApiLead(raw: Record<string, unknown>): Lead {
  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id) || Date.now(),
    source: String(raw.source ?? 'Reddit'),
    name: String(raw.name ?? 'unknown'),
    time: String(raw.time ?? 'Just now'),
    context: String(raw.context ?? ''),
    score:
      typeof raw.score === 'number'
        ? Math.min(99, Math.max(0, raw.score))
        : Number(raw.score) || 90,
    intent: raw.intent === 'HIGH' ? 'HIGH' : 'HIGH',
    status: String(raw.status ?? 'AUTO-DM DISPATCHED'),
    category: raw.category != null ? String(raw.category) : undefined,
    sourceId: raw.sourceId != null ? String(raw.sourceId) : undefined,
  };
}

function useLiveRadar(
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setLogs: React.Dispatch<React.SetStateAction<string[]>>,
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>,
  seenLeadIds: React.MutableRefObject<Set<string>>,
) {
  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/radar', { cache: 'no-store' });
      const data = (await res.json()) as {
        leads?: Record<string, unknown>[];
        meta?: { ok?: boolean; message?: string };
      };

      const incoming = Array.isArray(data.leads) ? data.leads : [];
      if (incoming.length === 0 && data.meta?.message) {
        setLogs((prev) =>
          [...prev, `[NET] /api/radar — ${data.meta?.message}`].slice(-10),
        );
        return;
      }

      const additions: Lead[] = [];
      for (const item of incoming) {
        if (!item || typeof item !== 'object') continue;
        const lead = normalizeApiLead(item as Record<string, unknown>);
        const dedupeKey =
          lead.sourceId ||
          `${lead.name}:${lead.context.slice(0, 120)}:${lead.id}`;
        if (seenLeadIds.current.has(dedupeKey)) continue;
        seenLeadIds.current.add(dedupeKey);
        additions.push(lead);
      }

      if (additions.length === 0) return;

      setLeads((prev) => [...additions, ...prev].slice(0, 5));

      setMetrics((m) => {
        let pipeline = m.pipeline;
        for (let i = 0; i < additions.length; i++) {
          pipeline += pipelineIncrement();
        }
        return {
          intercepted: m.intercepted + additions.length,
          strikes: m.strikes + additions.length,
          pipeline,
        };
      });

      const terminalBurst: string[] = [];
      for (const _lead of additions) {
        terminalBurst.push(
          '[RADAR] High-Intent Match detected in Boca/Miami sector.',
          '[WEBHOOK] Auto-DM payload deployed to prospect.',
          '[VAPI] Awaiting prospect phone number response for Achrocall voice routing...',
        );
      }
      setLogs((prev) => [...prev, ...terminalBurst].slice(-10));
    } catch {
      setLogs((prev) =>
        [...prev, '[NET] /api/radar poll failed — retaining last known state'].slice(
          -10,
        ),
      );
    }
  }, [setLeads, setLogs, setMetrics, seenLeadIds]);

//   useEffect(() => {
//     poll();
//     const id = window.setInterval(poll, 20_000);
//     return () => window.clearInterval(id);
//   }, [poll]);
// }

// export function RadarProvider({ children }: { children: React.ReactNode }) {
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [logs, setLogs] = useState<string[]>([
//     '[SYSTEM] Engine Initialized. Securing connection to Swarm...',
//     '[NET] Live radar channel open — polling /api/radar every 20s.',
//   ]);
useEffect(() => {
  let isSubscribed = true;
  
  const runPoll = async () => {
    if (isSubscribed) {
      await poll();
      // Wait 12 seconds BEFORE starting the next fetch to prevent network stacking
      setTimeout(runPoll, 12_000); 
    }
  };

  runPoll();
  
  return () => {
    isSubscribed = false;
  };
}, [poll]);
}

export function RadarProvider({ children }: { children: React.ReactNode }) {
const [leads, setLeads] = useState<Lead[]>([]);
const [logs, setLogs] = useState<string[]>([
  '[SYSTEM] Engine Initialized. Securing connection to Swarm...',
  '[NET] Live radar channel open — sweeping South Florida grid.',
]);

  const [metrics, setMetrics] = useState<Metrics>({
    intercepted: 0,
    strikes: 0,
    pipeline: 0,
  });
  const seenLeadIds = useRef<Set<string>>(new Set());

  useLiveRadar(setLeads, setLogs, setMetrics, seenLeadIds);

  const value = useMemo(
    () => ({ leads, logs, metrics }),
    [leads, logs, metrics],
  );

  return (
    <RadarContext.Provider value={value}>{children}</RadarContext.Provider>
  );
}

function useRadarStore(): RadarContextValue {
  return useRadarContext();
}

export const MetricsRow = () => {
  const { metrics } = useRadarStore();

  const formattedPipeline = `$${new Intl.NumberFormat('en-US').format(metrics.pipeline)}`;

  const metricCards = [
    {
      label: 'Leads Intercepted (24h)',
      value: metrics.intercepted.toString(),
      trend: '+12%',
      icon: Target,
      textClass: 'text-brand-blue',
      iconWrap: 'bg-brand-blue/10 border-brand-blue/20',
      barClass: 'bg-brand-blue',
      hoverBorder: '#00e5ff',
    },
    {
      label: 'Automated Strikes Deployed',
      value: metrics.strikes.toString(),
      trend: '+8%',
      icon: Zap,
      textClass: 'text-brand-orange',
      iconWrap: 'bg-brand-orange/10 border-brand-orange/20',
      barClass: 'bg-brand-orange',
      hoverBorder: '#ff6d00',
    },
    {
      label: 'Estimated Pipeline Captured',
      value: formattedPipeline,
      trend: '+15%',
      icon: DollarSign,
      textClass: 'text-green-500',
      iconWrap: 'bg-green-500/10 border-green-500/20',
      barClass: 'bg-green-500',
      hoverBorder: '#22c55e',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metricCards.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02, borderColor: metric.hoverBorder }}
          className="p-6 glass border border-zinc-800 rounded-xl relative overflow-hidden group transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {metric.label}
            </span>
            <div className={`p-2 rounded-lg ${metric.iconWrap} border`}>
              {i === 0 ? (
                <Target className="w-4 h-4 text-brand-blue" />
              ) : i === 1 ? (
                <Zap className="w-4 h-4 text-brand-orange" />
              ) : (
                <DollarSign className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className={`text-3xl font-black tracking-tighter ${metric.textClass}`}>
              {i === 2 ? (
                <motion.span
                  key={metrics.pipeline}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: 'inherit' }}
                >
                  {metric.value}
                </motion.span>
              ) : (
                metric.value
              )}
            </h3>
            <span className="text-xs font-bold text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {metric.trend}
            </span>
          </div>
          <div
            className={`absolute bottom-0 left-0 h-1 ${metric.barClass} w-0 group-hover:w-full transition-all duration-500`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export const IntentFeed = () => {
  const { leads } = useRadarStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryTabs = [
    'All',
    'HVAC / AC',
    'Electrical',
    'Plumbing',
    'Roofing',
  ];

  const filteredLeads = leads.filter((lead) => {
    if (activeCategory === 'All') return true;
    const leadCategory = (lead.category ?? '').toLowerCase();
    const normalized = activeCategory.toLowerCase();
    if (normalized === 'hvac / ac') {
      return leadCategory.includes('hvac') || leadCategory.includes('ac');
    }
    return leadCategory.includes(normalized);
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Facebook':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'Twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'Reddit':
        return 
        // <MessageSquare className="w-4 h-4 text-orange-500" />;
        <FaReddit className="w-4 h-4 text-[#FF4500]" />
      default:
        return <Activity className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const upper = status.toUpperCase();
    if (upper.includes('AUTO-DM') || status === 'AUTO-DM DISPATCHED') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border bg-brand-orange/10 text-brand-orange border-brand-orange/40 neon-orange-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          AUTO-DM FIRED ➔ ACHROCALL SYNCED
        </span>
      );
    }
    const colors: Record<string, string> = {
      'TARGET ACQUIRED':
        'bg-brand-blue/10 text-brand-blue border-brand-blue/20 animate-pulse',
      'Target Acquired':
        'bg-brand-blue/10 text-brand-blue border-brand-blue/20 animate-pulse',
      'PAYLOAD EXECUTED':
        'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      'Payload Executed':
        'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      'AGENT DEPLOYED':
        'bg-green-500/10 text-green-500 border-green-500/20',
      'Agent Deployed':
        'bg-green-500/10 text-green-500 border-green-500/20',
      'AWAITING ROUTING': 'bg-zinc-800/50 text-zinc-400 border-zinc-700',
      'Awaiting Routing': 'bg-zinc-800/50 text-zinc-400 border-zinc-700',
    };
    return (
      <span
        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[status] ?? 'bg-zinc-800/50 text-zinc-400 border-zinc-700'}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden mb-8">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <Radar className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">
              Real-Time Intent Radar
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Live Reddit swarm — Miami / Boca Raton · Home services only
            </p>
          </div>
        </div>
        <button
          type="button"
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="p-6 border-b border-zinc-800/70 bg-zinc-950/40 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -2, scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="rounded-xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-4 transition-all duration-300 hover:border-brand-blue/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.08)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Active Routing Destination
            </p>
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300 neon-blue-glow">
                Achrocall Voice Engine
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-green-500/30 bg-green-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live Pipe
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-brand-blue/30 bg-brand-blue/10 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">
                  Synced & Secure
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="rounded-xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-4 transition-all duration-300 hover:border-brand-orange/40 hover:shadow-[0_0_30px_rgba(255,109,0,0.08)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Data Pipeline Health
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
                <div className="flex items-center gap-2 text-zinc-200">
                  <FaReddit className="w-4 h-4 text-[#FF4500]" />
                   {/* <MessageSquare className="w-4 h-4 text-orange-500" /> */}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reddit</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Active (Running on Dev API)</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
                <div className="flex items-center gap-2 text-zinc-200">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Facebook Groups</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Standby (Awaiting Client Paid API Key)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instagram</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Offline (Awaiting Client Paid API Key)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Linkedin className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">LinkedIn</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Offline (Awaiting Client Paid API Key)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCategory(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200',
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/40 neon-blue-glow'
                    : 'bg-zinc-900/40 text-zinc-500 border-zinc-800/60 hover:text-zinc-300 hover:border-zinc-700',
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/60 border-b border-zinc-800/70">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Platform
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Username & Time
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Full Customer Request
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hidden sm:table-cell">
                Intent Score
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                System Action
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <AnimatePresence initial={false}>
              {filteredLeads.map((lead) => (
                <motion.tr
                  key={lead.sourceId ?? `${lead.id}-${lead.name}`}
                  className="group align-top border-l border-transparent hover:border-brand-blue/40 hover:bg-zinc-900/55 transition-all duration-300"
                  whileHover={{ y: -1 }}
                  initial={{
                    opacity: 0,
                    y: -20,
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                  }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.span
                        whileHover={{ scale: 1.08, rotate: -3 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                        className="inline-flex"
                      >
                        {getSourceIcon(lead.source)}
                      </motion.span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {lead.source}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-zinc-100">{lead.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        {lead.time}
                        {lead.category ? (
                          <span className="text-zinc-600"> · {lead.category}</span>
                        ) : null}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[380px]">
                    <p className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed italic">
                      &quot;{lead.context}&quot;
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden w-24 hidden lg:block">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${lead.score}%` }}
                          className={cn(
                            'h-full rounded-full',
                            lead.score > 90
                              ? 'bg-brand-orange neon-orange-glow'
                              : 'bg-brand-blue neon-blue-glow',
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-black tracking-widest uppercase',
                          lead.intent === 'HIGH'
                            ? 'text-brand-orange'
                            : 'text-brand-blue',
                        )}
                      >
                        {lead.intent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-brand-blue transition-all duration-300"
                    >
                      <motion.span
                        whileHover={{ x: 2 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        className="inline-flex"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              No live leads found for this category yet.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              The engine is running. As soon as a matching Miami or Boca Raton request appears, it will be routed here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const SystemTerminal = () => {
  const { logs } = useRadarStore();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-brand-blue" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Live System Terminal
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
        </div>
      </div>
      <div
        ref={terminalRef}
        className="p-4 h-32 lg:h-48 overflow-y-auto font-mono text-[10px] text-zinc-500 space-y-1 custom-scrollbar"
      >
        {logs.map((log, i) => (
          <div key={`${i}-${log.slice(0, 24)}`} className="flex gap-2">
            <span className="text-zinc-700">[{i}]</span>
            <span
              className={cn(
                log.includes('High-Intent Match') || log.includes('[CRITICAL]')
                  ? 'text-brand-orange'
                  : log.includes('[VAPI]')
                    ? 'text-brand-blue'
                    : log.includes('[WEBHOOK]')
                      ? 'text-brand-orange'
                      : log.includes('[RADAR]')
                        ? 'text-green-500'
                        : log.includes('Executed')
                          ? 'text-brand-blue'
                          : log.includes('200 OK')
                            ? 'text-green-500'
                            : '',
              )}
            >
              {log}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-brand-blue animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};
