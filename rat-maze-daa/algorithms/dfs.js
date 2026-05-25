/**
 * algorithms/dfs.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — Depth-First Search (DFS) Iterative
 *
 * Approach:
 *   Uses an explicit LIFO stack (avoids call-stack limits).
 *   Explores as deep as possible before backtracking.
 *   Does NOT guarantee the shortest path.
 *
 * Time  Complexity : O(N²)  — every cell visited once
 * Space Complexity : O(N²)  — stack + parent table
 *
 * Returns:
 *   Array of animation frames, each frame = { visited, current, solution? }
 */

window.AlgoDFS = function solveDFS(maze, N) {
  const visited = Array.from({ length: N }, () => Array(N).fill(false));
  const parent  = Array.from({ length: N }, () => Array(N).fill(null));
  const steps   = [];

  function copy2D(arr) { return arr.map(row => row.slice()); }

  // Push in reverse order so Down/Right are preferred
  const DIRS = [[-1, 0], [0, -1], [0, 1], [1, 0]];

  const stack = [[0, 0]];
  let found = false;

  while (stack.length > 0 && !found) {
    const [r, c] = stack.pop();
    if (visited[r][c]) continue;

    visited[r][c] = true;
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
        parent[nr][nc] = [r, c];
        stack.push([nr, nc]);
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
