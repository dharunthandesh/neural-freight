import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, CloudLightning, Navigation, Loader2, Cpu, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkMap from './components/NetworkMap';
import { findPath } from './utils/graph';
import { getNeuralAudit } from './services/intelligence';

interface NeuralTrace {
  agent: string;
  reasoning: string;
  recommendation: string;
  riskScore: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
  type: 'alert' | 'success' | 'info';
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<'normal' | 'disruption' | 'rerouting' | 'optimized'>('normal');
  const [rippleScores, setRippleScores] = useState<Record<string, number>>({
    'SHA': 42, 'HKG': 35, 'SIN': 28, 'DXB': 15, 'ROT': 10, 'MUM': 12
  });
  const [disruptedNodes, setDisruptedNodes] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string[]>(['SHA', 'HKG', 'SIN', 'DXB', 'ROT']);
  const [oldPath, setOldPath] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [globalStress, setGlobalStress] = useState(12);
  const [cascadeRisk, setCascadeRisk] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAudit, setAiAudit] = useState<NeuralTrace | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (agent: string, action: string, details: string, type: 'alert' | 'success' | 'info' = 'info') => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      agent,
      action,
      details,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const triggerDisruption = async () => {
    setPhase('disruption');
    setOldPath(['SHA', 'HKG', 'SIN', 'DXB', 'ROT']);
    setGlobalStress(68);
    setCascadeRisk(75);
    setRippleScores(prev => ({ ...prev, 'SHA': 94 }));
    addLog('SYSTEM', 'CRITICAL SPIKE', 'SHA Ripple Score hit 94. High-risk weather anomaly detected.', 'alert');
    
    await new Promise(r => setTimeout(r, 2000));
    setRippleScores(prev => ({ ...prev, 'HKG': 85, 'SIN': 72 }));
    setDisruptedNodes(['SHA', 'HKG']);
    addLog('GNN', 'CASCADE DETECTED', 'Stress propagating to HKG/SIN nerve cluster. Risk level 75%.', 'alert');

    // AI BRAIN ACTIVATION
    await new Promise(r => setTimeout(r, 1000));
    setIsProcessing(true);
    addLog('GOOGLE-GEMINI', 'NEURAL AUDIT', 'Initializing real-time scenario analysis...', 'info');
    
    // Call Gemini for Audit
    const audit = await getNeuralAudit('SHA', 94);
    setAiAudit(audit);
    
    await new Promise(r => setTimeout(r, 1000));
    setPhase('rerouting');
    addLog('NEURAL-BRAIN', 'ANALYZING', 'Evaluating 1,240 alternative pathways via MUM Fallback.', 'info');
    
    await new Promise(r => setTimeout(r, 2500));
    setIsProcessing(false);
    const newPath = findPath('SHA', 'ROT', ['SHA', 'HKG']);
    setActivePath(newPath);
    addLog(audit.agent, 'REROUTED', 'Shipment ID:NF-881 diverted via MUMBAI corridor.', 'success');

    await new Promise(r => setTimeout(r, 1500));
    setPhase('optimized');
    addLog('AGENT #02', 'OPTIMIZED', 'Air Freight upgrade secured for perishable units.', 'success');
    addLog('SYSTEM', 'REALIGNED', 'Network stabilized. ₹4,17,000 penalties avoided.', 'success');
  };

  const resetSystem = () => {
    setPhase('normal');
    setDisruptedNodes([]);
    setOldPath([]);
    setActivePath(['SHA', 'HKG', 'SIN', 'DXB', 'ROT']);
    setLogs([]);
    setGlobalStress(12);
    setCascadeRisk(4);
    setIsProcessing(false);
    setAiAudit(null);
    setRippleScores({
      'SHA': 42, 'HKG': 35, 'SIN': 28, 'DXB': 15, 'ROT': 10, 'MUM': 12
    });
  };

  return (
    <div className="app-container">
      <div className="neural-grid" />
      
      <header className="dashboard-header">
        <div className="header-main">
          <div className="logo-section">
            <Activity className="logo-icon pulse-icon" />
            <h1 className="glow-text">NEURAL<span>FREIGHT</span></h1>
          </div>
          <div className="header-divider" />
          <div className="system-path">
            <span className="path-label">NETWORK NERVE PATHWAY:</span>
            <span className="path-value">ASIA-PACIFIC / SHA-ROT CORRIDOR</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="google-ai-badge">
            <Cpu size={14} className="text-primary" />
            <span>POWERED BY GOOGLE GEMINI AI</span>
          </div>

          <button 
            className={`sim-btn ${phase === 'normal' ? 'primary' : 'danger'}`}
            onClick={phase === 'normal' ? triggerDisruption : resetSystem}
          >
            <div className="btn-glow" />
            {phase === 'normal' ? <CloudLightning size={16} /> : <Navigation size={16} />}
            <span>{phase === 'normal' ? 'SIMULATE TYPHOON' : 'RESET SYSTEM'}</span>
          </button>
          
          <div className="status-container">
            <div className={`signal-pulse ${phase === 'normal' ? 'healthy' : 'critical'}`} />
            <span className="status-text">{phase.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-layout">
        <section className="main-content">
          <div className="hero-grid mb-4">
            <div className="glass-card hero-stat">
              <span className="stat-label">SHA RIPPLE SCORE</span>
              <span className={`stat-value ${rippleScores['SHA'] > 75 ? 'critical' : ''}`}>
                {rippleScores['SHA']}
              </span>
              <span className="stat-desc">NODE DEPENDENCY: 12</span>
            </div>
            <div className="glass-card hero-stat">
              <span className="stat-label">GLOBAL STRESS</span>
              <span className={`stat-value ${globalStress > 50 ? 'critical' : ''}`}>
                {globalStress}%
              </span>
              <span className="stat-desc">SYSTEM VULNERABILITY</span>
            </div>
            <div className="glass-card hero-stat">
              <span className="stat-label">CASCADE RISK</span>
              <span className={`stat-value ${cascadeRisk > 50 ? 'critical' : ''}`}>
                {cascadeRisk}%
              </span>
              <span className="stat-desc">GNN PREDICTION</span>
            </div>
          </div>

          <NetworkMap 
            disruptedNodes={disruptedNodes} 
            activePath={activePath} 
            oldPath={oldPath}
            rippleScores={rippleScores} 
            phase={phase}
          />

          <AnimatePresence>
            {aiAudit && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card mt-4 p-6 ai-trace-panel"
              >
                <div className="card-header mb-4">
                  <ShieldAlert size={20} className="text-primary" />
                  <h2>GEMINI NEURAL TRACE: AUDIT LOG</h2>
                </div>
                <div className="trace-grid">
                  <div className="trace-item">
                    <span className="trace-label">REASONING ENGINE</span>
                    <p className="trace-text">{aiAudit.reasoning}</p>
                  </div>
                  <div className="trace-item">
                    <span className="trace-label">TACTICAL RECOMMENDATION</span>
                    <p className="trace-text text-primary">{aiAudit.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="sidebar">
          <div className="glass-card log-card">
            <div className="card-header">
              <Zap size={20} />
              <h2>AGENT AUCTION LOG (LIVE)</h2>
            </div>
            <div className="log-list">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className={`log-entry ${log.type}`}
                  >
                    <div className="log-top">
                      <span className="log-time">{log.timestamp}</span>
                      <span className="log-agent">{log.agent}</span>
                    </div>
                    <div className="log-action-line">{log.action}</div>
                    <div className="log-details">{log.details}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isProcessing && (
                <div className="processing-indicator">
                  <Loader2 className="animate-spin" size={14} />
                  <span>NERVE BRAIN PROCESSING...</span>
                </div>
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          <div className="glass-card mt-4 result-impact-hero">
            <div className="impact-number-hero">
              {phase === 'optimized' ? '₹4,17,000' : '₹0'}
            </div>
            <div className="impact-label-hero">TOTAL PENALTIES AVOIDED</div>
            <div className="impact-sub-hero">9 HRS SAVED PER UNIT</div>
          </div>
        </aside>
      </main>

      <style>{`
        .app-container { max-width: 1400px; margin: 0 auto; padding: 2.5rem; min-height: 100vh; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem; }
        .header-main { display: flex; align-items: center; gap: 2rem; }
        .google-ai-badge { display: flex; align-items: center; gap: 0.5rem; background: rgba(0, 242, 255, 0.05); border: 1px solid rgba(0, 242, 255, 0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.65rem; font-weight: 800; color: var(--accent-primary); }
        
        .ai-trace-panel { border-left: 4px solid var(--accent-primary); background: linear-gradient(90deg, rgba(0, 242, 255, 0.05), transparent); }
        .trace-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .trace-label { font-size: 0.65rem; color: var(--accent-primary); letter-spacing: 1px; font-weight: 800; margin-bottom: 0.5rem; display: block; }
        .trace-text { font-size: 0.85rem; line-height: 1.5; font-weight: 500; }

        .dashboard-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2.5rem; }
        .hero-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .hero-stat { text-align: center; padding: 2.5rem 1.5rem; border: 1px solid var(--glass-border); min-height: 200px; display: flex; flex-direction: column; justify-content: center; }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 2px; margin-bottom: 1rem; font-weight: 800; }
        .stat-value { font-size: 4.5rem; font-weight: 1000; line-height: 1; letter-spacing: -2px; }
        .stat-desc { font-size: 0.65rem; color: var(--text-muted); margin-top: 1.25rem; }

        .log-card { height: 580px; display: flex; flex-direction: column; }
        .log-list { overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding: 1rem; flex-grow: 1; scroll-behavior: smooth; }
        .log-entry { padding: 1rem; background: rgba(255,255,255,0.03); border-left: 4px solid var(--accent-primary); }
        .log-entry.alert { border-left-color: var(--signal-critical); background: rgba(255, 0, 85, 0.05); }
        .log-entry.success { border-left-color: var(--signal-healthy); background: rgba(0, 255, 157, 0.05); }
        .log-top { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 800; margin-bottom: 0.4rem; }
        .log-action-line { font-size: 0.85rem; font-weight: 900; color: var(--accent-primary); }
        .log-details { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }

        .result-impact-hero { text-align: center; padding: 3rem; background: rgba(0, 255, 157, 0.05); border: 1px solid rgba(0, 255, 157, 0.2); }
        .impact-number-hero { font-size: 3rem; font-weight: 1000; color: var(--signal-healthy); }

        .sim-btn { position: relative; background: rgba(255, 0, 85, 0.1); border: 1px solid var(--signal-critical); color: var(--signal-critical); padding: 0.8rem 2rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 1rem; font-weight: 900; font-size: 0.75rem; letter-spacing: 2px; overflow: hidden; transition: 0.3s; }
        .sim-btn.primary { border-color: var(--accent-primary); color: var(--accent-primary); background: rgba(0, 242, 255, 0.1); }
        .sim-btn:hover { background: var(--signal-critical); color: white; box-shadow: 0 0 40px var(--signal-critical); }
        .sim-btn.primary:hover { background: var(--accent-primary); color: #000; box-shadow: 0 0 40px var(--accent-primary); }

        .btn-glow { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: 0.5s; }
        .sim-btn:hover .btn-glow { left: 100%; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
