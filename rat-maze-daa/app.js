/**
 * app.js
 * ─────────────────────────────────────────────
 * Rat in a Maze — Main Application
 *
 * Responsibilities:
 *   • Maze generation (recursive-division DFS carver)
 *   • Canvas renderer (cells, gradient highlights, emoji)
 *   • Mouse/touch drawing (click/drag to toggle walls)
 *   • Animation engine (frame-by-frame step replay)
 *   • UI wiring (buttons, sliders, algo/size pickers)
 */

'use strict';

// ── State ────────────────────────────────────────────────
let N         = 8;              // grid dimension
let maze      = [];             // 0 = wall, 1 = open
let algo      = 'backtrack';    // active algorithm key
let solving   = false;          // animation running?
let animTimer = null;           // setTimeout handle
let animQueue = [];             // pending frames
let startTime = 0;

// Drawing state
let isDrawing = false;
let drawMode  = 1;              // 1 = carve open, 0 = place wall

// ── Canvas ───────────────────────────────────────────────
const canvas = document.getElementById('mazeCanvas');
const ctx    = canvas.getContext('2d');

// ── Cell colour palette ──────────────────────────────────
const COLORS = {
  wall:      '#111126',
  open:      '#0f3460',
  visited:   '#3d2680',
  backtrack: '#1a1a38',
  current:   '#f5a623',
  solution:  '#e94560',
  start:     '#00d4aa',
  end:       '#00d4aa',
};

// ── Algorithm metadata ───────────────────────────────────
const ALGO_META = {
  backtrack: {
    label:  'BACKTRACKING',
    time:   'O(2^N²)',
    space:  'O(N²)',
    runner: () => window.AlgoBacktrack(maze, N),
  },
  bfs: {
    label:  'BFS',
    time:   'O(N²)',
    space:  'O(N²)',
    runner: () => window.AlgoBFS(maze, N),
  },
  dfs: {
    label:  'DFS',
    time:   'O(N²)',
    space:  'O(N²)',
    runner: () => window.AlgoDFS(maze, N),
  },
  dijkstra: {
    label:  "DIJKSTRA'S",
    time:   'O(N² log N)',
    space:  'O(N²)',
    runner: () => window.AlgoDijkstra(maze, N),
  },
  astar: {
    label:  'A* (A-STAR)',
    time:   'O(N²)',
    space:  'O(N²)',
    runner: () => window.AlgoAStar(maze, N),
  },
};

// ── Maze generation ──────────────────────────────────────
function initMaze() {
  maze = Array.from({ length: N }, () => Array(N).fill(0));
}

function generateMaze() {
  stopSolve();
  initMaze();

  // Recursive-DFS carver (creates paths on odd-coord grid)
  const vis = Array.from({ length: N }, () => Array(N).fill(false));

  function carve(r, c) {
    vis[r][c] = true;
    maze[r][c] = 1;
    const dirs = [[0,2],[2,0],[0,-2],[-2,0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && !vis[nr][nc]) {
        maze[r + dr / 2][c + dc / 2] = 1; // knock out wall between
        carve(nr, nc);
      }
    }
  }
  carve(0, 0);

  // Extra random openings for branching paths
  const extra = Math.floor(N * N * 0.07);
  for (let i = 0; i < extra; i++) {
    const r = 1 + Math.floor(Math.random() * (N - 2));
    const c = 1 + Math.floor(Math.random() * (N - 2));
    if (!(r === 0 && c === 0) && !(r === N-1 && c === N-1)) {
      maze[r][c] = 1;
    }
  }

  // Guarantee start and end are open
  maze[0][0]         = 1;
  maze[N-1][N-1]     = 1;

  resetStats();
  drawMaze();
  setStatus('New maze generated — click ▶ Solve to start', '');
}

function clearMaze() {
  stopSolve();
  resetStats();
  drawMaze();
  setStatus('Path cleared — ready to solve', '');
}

function emptyMaze() {
  stopSolve();
  maze = Array.from({ length: N }, () => Array(N).fill(1));
  maze[0][0] = maze[N-1][N-1] = 1;
  resetStats();
  drawMaze();
  setStatus('All walls cleared — draw your own maze!', '');
}

// ── Canvas drawing ───────────────────────────────────────
function drawMaze(highlights) {
  const w = canvas.offsetWidth || 400;
  canvas.width  = w;
  canvas.height = w;
  const cs = w / N;   // cell size

  ctx.clearRect(0, 0, w, w);

  const h = highlights || {};
  const solSet = new Set(
    (h.solution || []).map(([r, c]) => `${r},${c}`)
  );

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let color = maze[r][c] === 0 ? COLORS.wall : COLORS.open;

      if (h.visited && h.visited[r]?.[c]) {
        color = h.isBacktrackGrid?.[r]?.[c] ? COLORS.backtrack : COLORS.visited;
      }
      if (solSet.has(`${r},${c}`))              color = COLORS.solution;
      if (h.current && h.current[0] === r && h.current[1] === c) color = COLORS.current;

      // Draw cell with slight padding
      const pad = Math.max(1, cs * 0.05);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(c * cs + pad, r * cs + pad, cs - pad * 2, cs - pad * 2, Math.max(2, cs * 0.12));
      ctx.fill();

      // Subtle brightness on solution cells
      if (solSet.has(`${r},${c}`) && !(h.current && h.current[0] === r && h.current[1] === c)) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(c * cs + pad, r * cs + pad, cs - pad * 2, (cs - pad * 2) * 0.4,
          [Math.max(2, cs * 0.12), Math.max(2, cs * 0.12), 0, 0]);
        ctx.fill();
      }
    }
  }

  // Grid lines (very subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= N; i++) {
    ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, w); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(w, i * cs); ctx.stroke();
  }

  // Start cell overlay (teal)
  const padS = Math.max(1, cs * 0.05);
  ctx.fillStyle = COLORS.start;
  ctx.beginPath();
  ctx.roundRect(padS, padS, cs - padS * 2, cs - padS * 2, Math.max(2, cs * 0.12));
  ctx.fill();

  // End cell overlay
  ctx.fillStyle = COLORS.end;
  ctx.beginPath();
  ctx.roundRect((N-1)*cs + padS, (N-1)*cs + padS, cs - padS*2, cs - padS*2, Math.max(2, cs*0.12));
  ctx.fill();

  // Emoji rendering
  const fs = Math.max(10, cs * 0.6);
  ctx.font         = `${fs}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Rat follows current position (or stays at start)
  const ratPos = h.current ? h.current : [0, 0];
  ctx.fillText('🐭', ratPos[1] * cs + cs / 2, ratPos[0] * cs + cs / 2);

  // Flag at goal
  ctx.fillText('🏁', (N-1) * cs + cs / 2, (N-1) * cs + cs / 2);
}

// ── Solve / Animation ────────────────────────────────────
function startSolve() {
  if (solving) { stopSolve(); return; }

  const meta = ALGO_META[algo];
  solving   = true;
  startTime = performance.now();

  document.getElementById('solveBtn').textContent = '■  Stop';
  setStatus(`Solving with ${meta.label}…`, 'running');
  resetStats();

  animQueue = meta.runner();
  runAnimation();
}

function stopSolve() {
  solving = false;
  clearTimeout(animTimer);
  document.getElementById('solveBtn').textContent = '▶  Solve';
}

function runAnimation() {
  if (!solving || animQueue.length === 0) {
    stopSolve();
    if (animQueue.length === 0) setStatus('No path found!', 'fail');
    return;
  }

  const step  = animQueue.shift();
  const speed = parseInt(document.getElementById('speedSlider').value, 10);
  // Exponential speed curve: speed=1 → ~300ms, speed=10 → ~5ms
  const delay = Math.round(300 / (speed * speed * 0.4 + 1));

  // Count visited cells
  let visited = 0;
  if (step.visited) {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++)
        if (step.visited[r][c]) visited++;
  }

  // Update stats
  document.getElementById('stVisited').textContent  = visited;
  document.getElementById('stBacktrack').textContent = step.btCount ?? (step.isBacktrack ? '↑' : document.getElementById('stBacktrack').textContent);
  document.getElementById('stepCounter').textContent = `Steps: ${visited}`;

  // Build backtrack overlay
  let btGrid = null;
  if (step.isBacktrack && step.current) {
    btGrid = Array.from({ length: N }, () => Array(N).fill(false));
    btGrid[step.current[0]][step.current[1]] = true;
  }

  drawMaze({
    visited:        step.visited,
    current:        step.current,
    solution:       step.solution,
    isBacktrackGrid: btGrid,
  });

  if (step.solution) {
    const elapsed = Math.round(performance.now() - startTime);
    document.getElementById('stPathLen').textContent = step.solution.length;
    document.getElementById('stTime').textContent    = `${elapsed}ms`;
    document.getElementById('stVisited').textContent = visited;
    setStatus(`✓ Path found!  Length: ${step.solution.length}  ·  ${visited} cells explored`, 'success');
    stopSolve();
    return;
  }

  animTimer = setTimeout(runAnimation, delay);
}

// ── Stats helpers ─────────────────────────────────────────
function resetStats() {
  ['stVisited','stPathLen','stBacktrack'].forEach(id => {
    document.getElementById(id).textContent = '0';
  });
  document.getElementById('stTime').textContent    = '0ms';
  document.getElementById('stepCounter').textContent = 'Steps: 0';
}

function setStatus(msg, type) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.className   = `status-msg ${type}`;
}

// ── UI wiring ─────────────────────────────────────────────

// Algorithm buttons
document.getElementById('algoList').addEventListener('click', e => {
  const btn = e.target.closest('.algo-btn');
  if (!btn) return;
  algo = btn.dataset.algo;
  document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const meta = ALGO_META[algo];
  document.getElementById('algoBadge').textContent   = meta.label;
  document.getElementById('complexityTag').textContent = `${meta.time} · Space: ${meta.space}`;
});

// Size buttons
document.getElementById('sizeRow').addEventListener('click', e => {
  const btn = e.target.closest('.size-btn');
  if (!btn) return;
  N = parseInt(btn.dataset.size, 10);
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  generateMaze();
});

// Action buttons
document.getElementById('solveBtn').addEventListener('click',    startSolve);
document.getElementById('generateBtn').addEventListener('click', generateMaze);
document.getElementById('clearBtn').addEventListener('click',    clearMaze);
document.getElementById('emptyBtn').addEventListener('click',    emptyMaze);

// ── Mouse drawing ─────────────────────────────────────────
function cellFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const cs   = canvas.offsetWidth / N;
  const x    = e.clientX - rect.left;
  const y    = e.clientY - rect.top;
  return [Math.floor(y / cs), Math.floor(x / cs)];
}

function toggleCell(r, c) {
  if (r < 0 || r >= N || c < 0 || c >= N) return;
  if (r === 0   && c === 0)   return; // protect start
  if (r === N-1 && c === N-1) return; // protect end
  maze[r][c] = drawMode;
  drawMaze();
}

canvas.addEventListener('mousedown', e => {
  if (solving) return;
  isDrawing = true;
  const [r, c] = cellFromEvent(e);
  if (r < 0 || r >= N || c < 0 || c >= N) return;
  drawMode = maze[r][c] === 0 ? 1 : 0;
  toggleCell(r, c);
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing || solving) return;
  const [r, c] = cellFromEvent(e);
  toggleCell(r, c);
});

canvas.addEventListener('mouseup',    () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

// Touch support
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (solving) return;
  isDrawing = true;
  const touch = e.touches[0];
  const [r, c] = cellFromEvent(touch);
  if (r < 0 || r >= N || c < 0 || c >= N) return;
  drawMode = maze[r][c] === 0 ? 1 : 0;
  toggleCell(r, c);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!isDrawing || solving) return;
  const [r, c] = cellFromEvent(e.touches[0]);
  toggleCell(r, c);
}, { passive: false });

canvas.addEventListener('touchend', () => { isDrawing = false; });

// Resize: redraw without losing state
window.addEventListener('resize', () => drawMaze());

// ── Boot ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  generateMaze();
});
