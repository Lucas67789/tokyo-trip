/**
 * 도쿄 지하철 최단 경로 탐색 엔진 (Dijkstra 알고리즘)
 */

export interface Edge {
  targetId: string;
  weight: number; 
  lineId: string; 
}

export type Graph = Record<string, Edge[]>;

export interface PathResult {
  path: string[];     
  totalTime: number;  
  transfers: number;  
  instructions: string[];
}

export function findShortestPath(graph: Graph, startId: string, endId: string): PathResult | null {
  if (!graph[startId] || !graph[endId]) return null;

  const distances: Record<string, number> = {};
  const previous: Record<string, { station: string; line: string } | null> = {};
  const queue = new Set<string>();

  for (const stationId in graph) {
    distances[stationId] = Infinity;
    previous[stationId] = null;
    queue.add(stationId);
  }
  distances[startId] = 0;

  while (queue.size > 0) {
    let minDistance = Infinity;
    let minStation: string | null = null;
    for (const stationId of queue) {
      if (distances[stationId] < minDistance) {
        minDistance = distances[stationId];
        minStation = stationId;
      }
    }

    if (minStation === null) break;
    if (minStation === endId) break; 

    queue.delete(minStation);

    for (const neighbor of graph[minStation]) {
      if (!queue.has(neighbor.targetId)) continue;
      
      const alt = distances[minStation] + neighbor.weight;
      if (alt < distances[neighbor.targetId]) {
        distances[neighbor.targetId] = alt;
        previous[neighbor.targetId] = { station: minStation, line: neighbor.lineId };
      }
    }
  }

  if (distances[endId] === Infinity) return null;

  const path: string[] = [];
  let current: string | null = endId;
  let transfers = 0;
  let currentLine = previous[endId]?.line;

  while (current) {
    path.unshift(current);
    const prev: { station: string; line: string } | null = previous[current];
    if (prev && prev.line !== currentLine && current !== endId) {
      transfers++;
      currentLine = prev.line;
    }
    current = prev ? prev.station : null;
  }

  const instructions: string[] = [
    `${startId}에서 출발`,
    `${endId} 도착`
  ];

  return {
    path,
    totalTime: distances[endId],
    transfers,
    instructions
  };
}

export const MOCK_SUBWAY_GRAPH: Graph = {
  "tokyo": [
    { targetId: "ginza", weight: 3, lineId: "marunouchi" },
    { targetId: "shinjuku", weight: 14, lineId: "jr_chuo" },
  ],
  "ginza": [
    { targetId: "tokyo", weight: 3, lineId: "marunouchi" },
    { targetId: "shibuya", weight: 16, lineId: "ginza" },
  ],
  "shibuya": [
    { targetId: "ginza", weight: 16, lineId: "ginza" },
    { targetId: "shinjuku", weight: 5, lineId: "jr_yamanote" },
  ],
  "shinjuku": [
    { targetId: "shibuya", weight: 5, lineId: "jr_yamanote" },
    { targetId: "tokyo", weight: 14, lineId: "jr_chuo" },
  ]
};
