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

  // Strategy 1: Absolute shortest
  addResult(runDijkstra(start, end));

  // Strategy 2: Favor different lines
  addResult(runDijkstra(start, end, (lineId) => lineId.startsWith('nankai') ? 100 : 0));

  // Strategy 3: Avoid express
  addResult(runDijkstra(start, end, (lineId) => METRO_LINES[lineId]?.is_express ? 200 : 0));

  return results.sort((a, b) => a.totalTime - b.totalTime).slice(0, 3);
}

function runDijkstra(start: string, end: string, penaltyFn?: (lineId: string) => number): RouteResult | null {
  const distances: Record<string, number> = {};
  const previous: Record<string, { node: string; lineId: string; time: number } | null> = {};
  const queue = new Set<string>(Object.keys(METRO_STATIONS));

  for (const node in METRO_STATIONS) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  while (queue.size > 0) {
    let minNode: string | null = null;
    for (const node of queue) {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    }

    if (minNode === null || distances[minNode] === Infinity) break;
    if (minNode === end) break;

    queue.delete(minNode);

    const neighbors = METRO_CONNECTIONS.filter(c => c.from === minNode || c.to === minNode);
    
    for (const conn of neighbors) {
      const neighborNode = conn.from === minNode ? conn.to : conn.from;
      if (!queue.has(neighborNode)) continue;

      let penalty = penaltyFn ? penaltyFn(conn.line) : 0;
      
      const prevData = previous[minNode];
      if (prevData && prevData.lineId !== conn.line) {
        penalty += 5; // Transfer penalty
      }

      const alt = distances[minNode] + conn.time + penalty;
      if (alt < distances[neighborNode]) {
        distances[neighborNode] = alt;
        previous[neighborNode] = { node: minNode, lineId: conn.line, time: conn.time };
      }
    }
  }

  if (distances[end] === Infinity) return null;

  const path: string[] = [];
  const steps: RouteStep[] = [];
  let curr: string | null = end;

  while (curr !== null) {
    path.unshift(curr);
    const prev: any = previous[curr];
    curr = prev ? prev.node : null;
  }

  const instructions: string[] = [];
  let currentLineId: string | null = null;
  let actualTime = 0;

  for (let i = 0; i < path.length; i++) {
    const stationSlug = path[i];
    const station = METRO_STATIONS[stationSlug];
    const nextPrev = previous[path[i+1]];
    const lineId = nextPrev ? nextPrev.lineId : (i > 0 ? previous[stationSlug]?.lineId : null);
    const line = lineId ? (METRO_LINES[lineId] || { id: "walk", name: "도보", color: "#94a3b8", code: "W" }) : null;

    let action: RouteStep["action"] = "BOARD";
    if (i === 0) action = "START";
    else if (i === path.length - 1) action = "END";
    else if (currentLineId && lineId !== currentLineId) action = "TRANSFER";
    else action = "BOARD";

    const stepTime = i === 0 ? 0 : (previous[stationSlug]?.time || 0);
    actualTime += stepTime;

    steps.push({
      station,
      line,
      action,
      time: stepTime
    });

    if (action === "START" && lineId && line) {
      instructions.push(`${line.name} 승차 (${station.name_ko})`);
      currentLineId = lineId;
    } else if (action === "TRANSFER" && lineId && line) {
      instructions.push(`${station.name_ko}에서 ${line.name}(으)로 환승`);
      currentLineId = lineId;
    } else if (action === "END") {
      instructions.push(`${station.name_ko} 도착`);
    }
  }

  return {
    path,
    totalTime: actualTime,
    steps,
    instructions
  };
}
