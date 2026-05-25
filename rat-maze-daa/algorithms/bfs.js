/**
 * algorithms/bfs.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — Breadth-First Search (BFS)
 *
 * Approach:
 *   Uses a FIFO queue. Explores all cells at distance
 *   d before any cell at distance d+1.  Guarantees the
 *   SHORTEST path (in terms of number of cells).
 *
 * Time  Complexity : O(N²)  — every cell visited once
 * Space Complexity : O(N²)  — queue + parent table
 *
 * Returns:
 *   Array of animation frames, each frame = { visited, current, solution? }
 */

window.AlgoBFS = function solveBFS(maze, N) {
  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const parent  = Array.from({ length: N }, () => Array(N).fill(null));
  const steps   = [];

  function copy2D(arr) { return arr.map(row => row.slice()); }

  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const queue = [[0, 0]];
  visited[0][0] = true;
  let found = false;

  while (queue.length > 0 && !found) {
    const [r, c] = queue.shift();

    steps.push({
      visited: copy2D(visited),
      current: [r, c],
      solution: null,
    });

    if (r === N - 1 && c === N - 1) { found = true; break; }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N
          && maze[nr][nc] === 1 && !visited[nr][nc]) {
        visited[nr][nc] = true;
        parent[nr][nc]  = [r, c];
        queue.push([nr, nc]);
      }
    }
  }

  // Reconstruct path by walking parent pointers
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
