import { 
  METRO_STATIONS, 
  METRO_CONNECTIONS, 
  METRO_LINES, 
  LineInfo, 
  StationData,
  Connection
} from "./metro_data";

export type RouteStep = {
  station: StationData;
  line: LineInfo | null;
  action: "START" | "BOARD" | "TRANSFER" | "ALIGHT" | "END";
  time: number;
};

export type RouteResult = {
  path: string[];
  totalTime: number;
  steps: RouteStep[];
  instructions: string[];
  transfers?: number;
};

export function findMultipleRoutes(start: string, end: string): RouteResult[] {
  if (!start || !end || start === end) return [];
  if (!METRO_STATIONS[start] || !METRO_STATIONS[end]) return [];

  const results: RouteResult[] = [];
  const seenPaths = new Set<string>();

  const addResult = (res: RouteResult | null) => {
    if (res) {
      const pathKey = res.path.join('-');
      if (!seenPaths.has(pathKey)) {
        results.push(res);
        seenPaths.add(pathKey);
      }
    }
  };

  // Strategy 1: Absolute shortest (구글맵 1순위)
  const shortest = runDijkstra(start, end, 'SHORTEST');
  addResult(shortest);

  // Strategy 2: Least transfers (환승 최소화, 구글맵 2순위)
  addResult(runDijkstra(start, end, 'LEAST_TRANSFERS'));

  // Strategy 3: Alternative Route (1순위에서 사용한 주요 노선 회피)
  if (shortest) {
    const linesUsed = new Set<string>();
    shortest.steps.forEach(s => {
      if (s.line && s.line.id !== 'walk') linesUsed.add(s.line.id);
    });
    if (linesUsed.size > 0) {
      addResult(runDijkstra(start, end, 'AVOID_LINES', Array.from(linesUsed)));
    }
  }

  return results.sort((a, b) => a.totalTime - b.totalTime).slice(0, 3);
}

function runDijkstra(
  start: string, 
  end: string, 
  strategy: 'SHORTEST' | 'LEAST_TRANSFERS' | 'AVOID_LINES',
  avoidLines: string[] = []
): RouteResult | null {
  // Multi-Layer Graph Node ID format: "stationSlug|lineId"
  const distances: Record<string, number> = {};
  const previous: Record<string, { node: string; time: number; type: 'RIDE'|'TRANSFER'|'WALK'|'START'|'END' }> = {};
  const queue = new Set<string>();

  Object.values(METRO_STATIONS).forEach(station => {
    station.lines.forEach(lineId => {
      const nodeId = `${station.slug}|${lineId}`;
      distances[nodeId] = Infinity;
      queue.add(nodeId);
    });
  });

  const startNode = `${start}|START`;
  distances[startNode] = 0;
  queue.add(startNode);

  const endNode = `${end}|END`;
  distances[endNode] = Infinity;
  queue.add(endNode);

  const edges: Record<string, Array<{ target: string; weight: number; type: 'RIDE'|'TRANSFER'|'WALK'|'START'|'END' }>> = {};
  const addEdge = (from: string, to: string, weight: number, type: 'RIDE'|'TRANSFER'|'WALK'|'START'|'END') => {
    if (!edges[from]) edges[from] = [];
    edges[from].push({ target: to, weight, type });
  };

  METRO_STATIONS[start].lines.forEach(lineId => {
    addEdge(startNode, `${start}|${lineId}`, 0, 'START');
  });

  METRO_STATIONS[end].lines.forEach(lineId => {
    addEdge(`${end}|${lineId}`, endNode, 0, 'END');
  });

  Object.values(METRO_STATIONS).forEach(station => {
    for (let i = 0; i < station.lines.length; i++) {
      for (let j = 0; j < station.lines.length; j++) {
        if (i !== j) {
          const l1 = station.lines[i];
          const l2 = station.lines[j];
          let transferCost = 5; // 기본 환승 5분
          if (strategy === 'LEAST_TRANSFERS') transferCost = 15;
          addEdge(`${station.slug}|${l1}`, `${station.slug}|${l2}`, transferCost, 'TRANSFER');
        }
      }
    }
  });

  METRO_CONNECTIONS.forEach(conn => {
    if (conn.line === 'walk') {
      const s1 = METRO_STATIONS[conn.from];
      const s2 = METRO_STATIONS[conn.to];
      if (!s1 || !s2) return;
      s1.lines.forEach(l1 => {
        s2.lines.forEach(l2 => {
          let walkCost = conn.time;
          if (strategy === 'LEAST_TRANSFERS') walkCost += 10;
          addEdge(`${conn.from}|${l1}`, `${conn.to}|${l2}`, walkCost, 'WALK');
          addEdge(`${conn.to}|${l2}`, `${conn.from}|${l1}`, walkCost, 'WALK');
        });
      });
    } else {
      const n1 = `${conn.from}|${conn.line}`;
      const n2 = `${conn.to}|${conn.line}`;
      let rideCost = conn.time;
      if (strategy === 'AVOID_LINES' && avoidLines.includes(conn.line)) {
        rideCost += 100; // 대안 경로 탐색 시 강제 회피 패널티
      }
      addEdge(n1, n2, rideCost, 'RIDE');
      addEdge(n2, n1, rideCost, 'RIDE');
    }
  });

  while (queue.size > 0) {
    let minNode: string | null = null;
    let minDistance = Infinity;
    for (const node of queue) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        minNode = node;
      }
    }

    if (minNode === null || distances[minNode] === Infinity) break;
    if (minNode === endNode) break;
    queue.delete(minNode);

    const neighbors = edges[minNode] || [];
    for (const neighbor of neighbors) {
      if (!queue.has(neighbor.target)) continue;
      const alt = distances[minNode] + neighbor.weight;
      if (alt < distances[neighbor.target]) {
        distances[neighbor.target] = alt;
        previous[neighbor.target] = { node: minNode, time: neighbor.weight, type: neighbor.type };
      }
    }
  }

  if (distances[endNode] === Infinity) return null;

  const path: string[] = [];
  const steps: RouteStep[] = [];
  const instructions: string[] = [];
  
  let curr = endNode;
  const rawPath: string[] = [];
  while (curr) {
    rawPath.unshift(curr);
    curr = previous[curr]?.node || '';
  }

  let actualTime = 0;
  let currentLineId: string | null = null;
  let totalTransfers = 0;

  for (let i = 1; i < rawPath.length - 1; i++) {
    const [stationSlug, lineId] = rawPath[i].split('|');
    const station = METRO_STATIONS[stationSlug];
    const line = METRO_LINES[lineId] || { id: "walk", name: "도보", color: "#94a3b8", code: "W" };
    const prevNode = rawPath[i-1];
    const edgeInfo = previous[rawPath[i]];
    
    if (path.length === 0 || path[path.length - 1] !== stationSlug) {
      path.push(stationSlug);
    }

    let action: RouteStep["action"] = "BOARD";
    if (i === 1) {
      action = "START";
      instructions.push(`${line.name} 승차 (${station.name_ko})`);
      currentLineId = lineId;
    }

    if (edgeInfo?.type === 'TRANSFER' || edgeInfo?.type === 'WALK') {
       if (currentLineId !== lineId) {
         action = "TRANSFER";
         instructions.push(`${station.name_ko}에서 ${line.name}(으)로 환승`);
         currentLineId = lineId;
         totalTransfers++;
       }
    }

    let stepTime = edgeInfo?.time || 0;
    
    // 복구: 인위적인 패널티를 제거하고 실제 순수 소요 시간만 누적
    if (edgeInfo?.type === 'TRANSFER') stepTime = 5;
    if (edgeInfo?.type === 'WALK') {
       const originalConn = METRO_CONNECTIONS.find(c => c.line === 'walk' && 
         ((c.from === prevNode.split('|')[0] && c.to === stationSlug) || 
          (c.to === prevNode.split('|')[0] && c.from === stationSlug)));
       stepTime = originalConn ? originalConn.time : 5;
    }
    if (edgeInfo?.type === 'RIDE') {
       const originalConn = METRO_CONNECTIONS.find(c => c.line === lineId && 
         ((c.from === prevNode.split('|')[0] && c.to === stationSlug) || 
          (c.to === prevNode.split('|')[0] && c.from === stationSlug)));
       stepTime = originalConn ? originalConn.time : 2;
    }
    if (edgeInfo?.type === 'START') stepTime = 0;

    actualTime += stepTime;

    if (edgeInfo?.type === 'RIDE' || edgeInfo?.type === 'TRANSFER' || edgeInfo?.type === 'WALK' || edgeInfo?.type === 'START') {
      steps.push({
        station,
        line,
        action,
        time: stepTime
      });
    }
  }

  const lastRaw = rawPath[rawPath.length - 2];
  const [lastStationSlug, lastLineId] = lastRaw.split('|');
  steps.push({
    station: METRO_STATIONS[lastStationSlug],
    line: METRO_LINES[lastLineId] || null,
    action: "END",
    time: 0
  });
  instructions.push(`${METRO_STATIONS[lastStationSlug].name_ko} 도착`);

  return {
    path,
    totalTime: actualTime,
    steps,
    instructions,
    transfers: totalTransfers
  };
}
