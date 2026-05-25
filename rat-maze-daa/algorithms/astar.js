/**
 * algorithms/astar.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — A* (A-Star) Search Algorithm
 *
 * Approach:
 *   Informed search using f(n) = g(n) + h(n)
 *     g(n) = cost from start to n (actual steps taken)
 *     h(n) = heuristic estimate from n to goal
 *
 *   Heuristic used: Manhattan Distance
 *     h(r,c) = |N-1 - r| + |N-1 - c|
 *   This is admissible (never overestimates) on a grid,
 *   so A* is guaranteed to find the OPTIMAL path.
 *
 *   A* visits far fewer cells than BFS/Dijkstra when
 *   the heuristic is tight — the key resume talking point!
 *
 * Time  Complexity : O(N²) worst-case, but usually much better
 * Space Complexity : O(N²)
 *
 * Returns:
 *   Array of animation frames, each frame = { visited, current, solution?, fScore, gScore }
 */

window.AlgoAStar = function solveAStar(maze, N) {
  const INF = Infinity;

  // g = actual cost from start
  const gScore  = Array.from({ length: N }, () => Array(N).fill(INF));
  // f = g + h
  const fScore  = Array.from({ length: N }, () => Array(N).fill(INF));
  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const parent  = Array.from({ length: N }, () => Array(N).fill(null));
  const steps   = [];
  const inOpen  = Array.from({ length: N }, () => Array(N).fill(false));

  function copy2D(arr) { return arr.map(row => row.slice()); }

  // Manhattan distance heuristic
  function heuristic(r, c) {
    return Math.abs(N - 1 - r) + Math.abs(N - 1 - c);
  }

  // Open-set priority queue: sorted by fScore
  const openSet = [];
  function pqPush(r, c) {
    openSet.push({ r, c, f: fScore[r][c] });
    openSet.sort((a, b) => a.f - b.f);
    inOpen[r][c] = true;
  }
  function pqPop() {
    const node = openSet.shift();
    inOpen[node.r][node.c] = false;
    return node;
  }

  gScore[0][0] = 0;
  fScore[0][0] = heuristic(0, 0);
  pqPush(0, 0);

  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  let found = false;

  while (openSet.length > 0 && !found) {
    const { r, c } = pqPop();
    if (visited[r][c]) continue;

    visited[r][c] = true;
    steps.push({
      visited:  copy2D(visited),
      current:  [r, c],
      solution: null,
      g: gScore[r][c],
      h: heuristic(r, c),
      f: fScore[r][c],
    });

    if (r === N - 1 && c === N - 1) { found = true; break; }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
      if (maze[nr][nc] === 0 || visited[nr][nc])   continue;

      const tentativeG = gScore[r][c] + 1;
      if (tentativeG < gScore[nr][nc]) {
        parent[nr][nc]  = [r, c];
        gScore[nr][nc]  = tentativeG;
        fScore[nr][nc]  = tentativeG + heuristic(nr, nc);
        pqPush(nr, nc);
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
