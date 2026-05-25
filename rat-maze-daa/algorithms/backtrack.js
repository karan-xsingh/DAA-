/**
 * algorithms/backtrack.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — Backtracking Algorithm
 *
 * Approach:
 *   Classic recursive backtracking (DFS with undo).
 *   Tries all 4 directions from every cell. If a
 *   path doesn't lead to the goal it UNDOES the move
 *   (backtracks) and tries the next direction.
 *
 * Time  Complexity : O(2^(N²))  — worst case all cells
 * Space Complexity : O(N²)      — recursion stack + visited array
 *
 * Returns:
 *   Array of animation frames, each frame = { visited, current, solution?, isBacktrack }
 */

window.AlgoBacktrack = function solveBacktrack(maze, N) {
  const visited  = Array.from({ length: N }, () => Array(N).fill(false));
  const path     = [];
  const steps    = [];
  let   btCount  = 0;

  // Helper: deep-copy a 2D boolean array
  function copy2D(arr) {
    return arr.map(row => row.slice());
  }

  // Directions: Down, Right, Up, Left
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

  function dfs(r, c) {
    // Boundary & validity check
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (maze[r][c] === 0)                    return false; // wall
    if (visited[r][c])                        return false; // already tried

    // Mark visited and record step
    visited[r][c] = true;
    path.push([r, c]);
    steps.push({
      visited:     copy2D(visited),
      current:     [r, c],
      solution:    null,
      isBacktrack: false,
    });

    // Goal reached?
    if (r === N - 1 && c === N - 1) {
      // Tag solution on last frame
      steps[steps.length - 1].solution = path.slice();
      return true;
    }

    // Explore all 4 directions
    for (const [dr, dc] of DIRS) {
      if (dfs(r + dr, c + dc)) return true;
    }

    // No direction worked → backtrack
    path.pop();
    btCount++;
    steps.push({
      visited:     copy2D(visited),
      current:     [r, c],
      solution:    null,
      isBacktrack: true,
      btCount,
    });

    return false;
  }

  dfs(0, 0);
  return steps;
};
