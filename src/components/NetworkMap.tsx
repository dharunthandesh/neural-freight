import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, AlertTriangle } from 'lucide-react';
import { ASIA_NODES, ASIA_EDGES } from '../utils/graph';

interface NetworkMapProps {
  disruptedNodes: string[];
  activePath: string[];
  oldPath: string[];
  rippleScores: Record<string, number>;
  phase: string;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ disruptedNodes, activePath, oldPath, rippleScores, phase }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getScoreReason = (nodeId: string) => {
    const score = rippleScores[nodeId] || 0;
    if (score > 80) return "HIGH DEPENDENCY + SEVERE WEATHER RISK + CONGESTION";
    if (score > 50) return "UPSWEEP RISK + UTILIZATION SPIKE";
    return "STABLE NERVE SIGNAL";
  };

  return (
    <div className="map-container glass-card">
      {/* Decision Moment Overlay */}
      <AnimatePresence>
        {phase === 'rerouting' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="decision-overlay"
          >
            <div className="decision-box">
              <AlertTriangle className="text-primary mb-2" size={32} />
              <h3>AUTONOMOUS REROUTE TRIGGERED</h3>
              <p>Bypassing SHA-HKG Blockage via MUM Fallback Corridor</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="map-overlay">
        <div className="status-indicator">
          {phase === 'disruption' && <span className="text-critical pulse-text">CASCADE IN PROGRESS...</span>}
          {phase === 'optimized' && <span className="text-primary pulse-text">NETWORK REALIGNED</span>}
        </div>
      </div>
      
      <svg viewBox="0 0 850 650" preserveAspectRatio="xMidYMid meet" className="network-svg">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 242, 255, 0.3)" />
          </marker>
          <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-primary)" />
          </marker>
        </defs>

        {/* Ambient Flow */}
        <AmbientFlow />

        {/* Connection Lines (Edges) */}
        {ASIA_EDGES.map((edge, _) => {
          const from = ASIA_NODES.find(n => n.id === edge.from)!;
          const to = ASIA_NODES.find(n => n.id === edge.to)!;
          const isActive = activePath.includes(edge.from) && activePath.includes(edge.to) && 
                          Math.abs(activePath.indexOf(edge.from) - activePath.indexOf(edge.to)) === 1;
          const isOld = oldPath.includes(edge.from) && oldPath.includes(edge.to) && 
                        !isActive && phase !== 'normal';
          
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <motion.line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isActive ? 'var(--accent-primary)' : isOld ? 'var(--signal-critical)' : 'rgba(255,255,255,0.05)'}
                strokeWidth={isActive ? 4 : isOld ? 2 : 1}
                strokeDasharray={isOld ? "5,5" : "0"}
                markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                initial={{ opacity: 0.1 }}
                animate={{ 
                  opacity: isActive ? 1 : isOld ? 0.3 : 0.1,
                  strokeOpacity: isActive ? 1 : 0.2
                }}
              />
              {isActive && (
                <motion.line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="var(--accent-primary)"
                  strokeWidth={10}
                  strokeOpacity={0.15}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {ASIA_NODES.map((node) => {
          const score = rippleScores[node.id] || 0;
          const isDisrupted = disruptedNodes.includes(node.id);
          
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'help' }}
            >
              {/* Node Glow */}
              <AnimatePresence>
                {score > 50 && (
                  <motion.circle
                    r={30}
                    fill="none"
                    stroke={score > 75 ? 'var(--signal-critical)' : 'var(--signal-warning)'}
                    strokeWidth={1}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </AnimatePresence>

              <motion.circle
                r={isDisrupted ? 20 : 16}
                fill={score > 75 ? 'var(--signal-critical)' : score > 40 ? 'var(--signal-warning)' : '#0d1117'}
                stroke={score > 75 ? 'var(--signal-critical)' : score > 40 ? 'var(--signal-warning)' : 'var(--accent-primary)'}
                strokeWidth={3}
                animate={{
                  scale: isDisrupted ? [1, 1.2, 1] : 1,
                  filter: score > 75 ? 'drop-shadow(0 0 15px var(--signal-critical))' : 'none'
                }}
              />

              <text y={-40} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" style={{ pointerEvents: 'none' }}>
                {node.id}
              </text>
              <text y={50} textAnchor="middle" 
                fill={score > 75 ? 'var(--signal-critical)' : score > 40 ? 'var(--signal-warning)' : 'var(--signal-healthy)'} 
                fontSize="20" fontWeight="1000" style={{ pointerEvents: 'none' }}>
                {score}
              </text>

              {/* Tooltip */}
              {hoveredNode === node.id && (
                <foreignObject x={20} y={-20} width={200} height={100}>
                  <div className="node-tooltip">
                    <div className="tooltip-title">RIPPLE ANALYSIS</div>
                    <div className="tooltip-reason">{getScoreReason(node.id)}</div>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* Cargo Icons */}
        <CargoIcon activePath={activePath} />

        {/* Rerouted Label */}
        {phase === 'optimized' && (
          <g transform={`translate(400, 480)`}>
            <rect x={-80} y={-15} width={160} height={30} rx={15} fill="rgba(0, 242, 255, 0.1)" stroke="var(--accent-primary)" strokeWidth={1} />
            <text textAnchor="middle" y={5} fill="var(--accent-primary)" fontSize="10" fontWeight="800" letterSpacing="1">
              REROUTED VIA MUMBAI
            </text>
          </g>
        )}
      </svg>

      <style>{`
        .map-container {
          height: 600px;
          position: relative;
          background: #020408;
          overflow: hidden;
        }

        .decision-overlay {
          position: absolute;
          inset: 0;
          background: rgba(2, 4, 8, 0.8);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .decision-box {
          text-align: center;
          padding: 3rem;
          border: 2px solid var(--accent-primary);
          background: rgba(0, 242, 255, 0.05);
          box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);
          border-radius: 8px;
        }

        .decision-box h3 { font-size: 1.5rem; color: var(--accent-primary); margin-bottom: 1rem; letter-spacing: 2px; }
        .decision-box p { font-size: 0.9rem; color: var(--text-muted); }

        .node-tooltip {
          background: rgba(13, 17, 23, 0.95);
          border: 1px solid var(--accent-primary);
          padding: 10px;
          border-radius: 4px;
          pointer-events: none;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }

        .tooltip-title { font-size: 0.6rem; color: var(--accent-primary); letter-spacing: 1px; margin-bottom: 4px; font-weight: 800; }
        .tooltip-reason { font-size: 0.7rem; color: #fff; line-height: 1.4; font-weight: 600; }
      `}</style>
    </div>
  );
};

const CargoIcon: React.FC<{ activePath: string[] }> = ({ activePath }) => {
  if (activePath.length < 2) return null;

  return (
    <>
      {activePath.slice(0, -1).map((nodeId, i) => {
        const from = ASIA_NODES.find(n => n.id === nodeId);
        const to = ASIA_NODES.find(n => n.id === activePath[i + 1]);
        if (!from || !to) return null;

        return (
          <motion.g
            key={`cargo-v2-${i}`}
            initial={{ x: from.x, y: from.y }}
            animate={{ x: to.x, y: to.y }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.8 }}
          >
            <circle r={12} fill="var(--accent-primary)" fillOpacity={0.2} />
            <motion.g transform="translate(-10, -10)">
               <Truck size={20} color="var(--accent-primary)" strokeWidth={3} />
            </motion.g>
          </motion.g>
        );
      })}
    </>
  );
};

const AmbientFlow: React.FC = () => {
  return (
    <>
      {ASIA_NODES.slice(0, -1).map((node, i) => {
        const from = node;
        const to = ASIA_NODES[i + 1];
        return (
          <React.Fragment key={`ambient-${i}`}>
            {[1, 2, 3].map(dot => (
              <motion.circle
                key={`dot-${i}-${dot}`}
                r={1.5}
                fill="rgba(0, 242, 255, 0.2)"
                initial={{ cx: from.x, cy: from.y }}
                animate={{ cx: to.x, cy: to.y }}
                transition={{ 
                  duration: 5 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: dot * 2,
                  ease: "linear" 
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NetworkMap;
