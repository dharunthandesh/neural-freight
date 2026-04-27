export interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  dependencyCount: number;
  utilization: number;
  weatherRisk: number;
}

export interface Edge {
  from: string;
  to: string;
  baseCost: number;
}

export const ASIA_NODES: Node[] = [
  { id: 'SHA', name: 'Shanghai', x: 700, y: 250, dependencyCount: 12, utilization: 82, weatherRisk: 5 },
  { id: 'HKG', name: 'Hong Kong', x: 650, y: 350, dependencyCount: 8, utilization: 75, weatherRisk: 8 },
  { id: 'SIN', name: 'Singapore', x: 550, y: 550, dependencyCount: 15, utilization: 60, weatherRisk: 3 },
  { id: 'DXB', name: 'Dubai', x: 250, y: 400, dependencyCount: 6, utilization: 45, weatherRisk: 2 },
  { id: 'ROT', name: 'Rotterdam', x: 100, y: 150, dependencyCount: 10, utilization: 55, weatherRisk: 10 },
  { id: 'MUM', name: 'Mumbai', x: 400, y: 450, dependencyCount: 4, utilization: 30, weatherRisk: 2 }, // Fallback node
];

export const ASIA_EDGES: Edge[] = [
  { from: 'SHA', to: 'HKG', baseCost: 10 },
  { from: 'HKG', to: 'SIN', baseCost: 15 },
  { from: 'SIN', to: 'DXB', baseCost: 40 },
  { from: 'DXB', to: 'ROT', baseCost: 50 },
  { from: 'SHA', to: 'MUM', baseCost: 60 }, // Long fallback
  { from: 'MUM', to: 'DXB', baseCost: 20 },
];

export const calculateRippleScore = (node: Node, globalStress: number): number => {
  // Ripple Score = (Dependency * 2) + (Utilization * 0.5) + (Weather * 3) + GlobalStress
  const score = (node.dependencyCount * 2) + (node.utilization * 0.4) + (node.weatherRisk * 3) + globalStress;
  return Math.min(Math.round(score), 100);
};

// Simple Dijkstra for rerouting
export const findPath = (start: string, end: string, disruptedNodes: string[]) => {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const nodes = ASIA_NODES.map(n => n.id);

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;
  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    let closestNode = Array.from(unvisited).reduce((min, node) => 
      distances[node] < distances[min] ? node : min
    );

    if (distances[closestNode] === Infinity) break;
    unvisited.delete(closestNode);

    if (closestNode === end) break;

    const neighbors = ASIA_EDGES.filter(e => e.from === closestNode);
    for (const edge of neighbors) {
      // Penalty for disrupted nodes
      const penalty = disruptedNodes.includes(edge.to) ? 1000 : 0;
      const alt = distances[closestNode] + edge.baseCost + penalty;
      
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = closestNode;
      }
    }
  }

  const path = [];
  let curr: string | null = end;
  while (curr) {
    path.push(curr);
    curr = previous[curr];
    if (curr === start) {
      path.push(start);
      break;
    }
    if (!curr) break;
  }
  
  const finalPath = path.reverse();
  return finalPath[0] === start ? finalPath : [start];
};
