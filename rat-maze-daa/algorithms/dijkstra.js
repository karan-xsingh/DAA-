/**
 * algorithms/dijkstra.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — Dijkstra's Shortest Path Algorithm
 *
 * Approach:
 *   Min-priority queue (simulated with array + sort).
 *   Every cell has a distance value; we always expand
 *   the unvisited cell with the smallest known distance.
 *   All edge weights = 1, so it finds the shortest path
 *   and visits cells in distance order (like BFS but
 *   generalisable to weighted graphs).
 *
 * Time  Complexity : O(N² log N)  — using min-heap
 * Space Complexity : O(N²)
 *
 * Returns:
 *   Array of animation frames, each frame = { visited, current, solution? }
 */

window.AlgoDijkstra = function solveDijkstra(maze, N) {
  const INF  = Infinity;
  const dist = Array.from({ length: N }, () => Array(N).fill(INF));
  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const parent  = Array.from({ length: N }, () => Array(N).fill(null));
  const steps   = [];

  function copy2D(arr) { return arr.map(row => row.slice()); }

  // Simple min-heap backed by sorted array
  // Each entry: { r, c, d }
  const pq = [];
  function pqPush(r, c, d) {
    pq.push({ r, c, d });
    pq.sort((a, b) => a.d - b.d);
  }
  function pqPop() { return pq.shift(); }

  dist[0][0] = 0;
  pqPush(0, 0, 0);

  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let found = false;

  while (pq.length > 0 && !found) {
    const { r, c, d } = pqPop();
    if (visited[r][c]) continue;

    visited[r][c] = true;
    steps.push({
      visited: copy2D(visited),
      current: [r, c],
      solution: null,
      dist: d,
    });

    if (r === N - 1 && c === N - 1) { found = true; break; }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N
          && maze[nr][nc] === 1 && !visited[nr][nc]) {
        const nd = d + 1;          // uniform weight = 1
        if (nd < dist[nr][nc]) {
          dist[nr][nc]    = nd;
          parent[nr][nc]  = [r, c];
          pqPush(nr, nc, nd);
        }
      }
    }
  }

  if (found) {
    const path = [];
    let [cr, cc] = [N - 1, N - 1];
    while (cr !== 0 || cc !== 0) {
      path.unshift([cr, cc]);
      const p = parent[cr][cc];
      if (!p) break;
      [cr, cc] = p;
    }
    path.unshift([0, 0]);
    steps[steps.length - 1].solution = path;
  }

  return steps;
};
