# 🐭 Rat in a Maze — DAA Project

> **Design & Analysis of Algorithms** · Pathfinding Visualizer
> Interactive visualization of 5 classic graph-traversal algorithms on a 2-D maze grid.

---

## 🚀 How to Run

```bash
# Clone / download the project, then open in VS Code
# Install the Live Server extension, then right-click index.html → Open with Live Server
```

Or just open `index.html` directly in any modern browser — no build step required.

---

## 📁 Project Structure

```
rat-maze-daa/
├── index.html              ← Entry point & HTML layout
├── app.js                  ← Main app: canvas renderer, controls, animation engine
├── styles/
│   └── main.css            ← Full UI stylesheet (dark theme, responsive)
└── algorithms/
    ├── backtrack.js        ← Recursive Backtracking
    ├── bfs.js              ← Breadth-First Search
    ├── dfs.js              ← Depth-First Search (iterative)
    ├── dijkstra.js         ← Dijkstra's Shortest Path
    └── astar.js            ← A* (A-Star) with Manhattan heuristic
```

---

## 🧠 Algorithms Implemented

### 1. Backtracking  `O(2^N²)` time · `O(N²)` space
Recursive DFS that **undoes** moves when a dead-end is reached. Each unsuccessful branch is abandoned and control returns to the last decision point. The most intuitive representation of the classic "Rat in a Maze" problem.

**Key insight:** Every cell is a binary choice (enter or skip) → exponential worst case.

---

### 2. Breadth-First Search (BFS)  `O(N²)` time · `O(N²)` space
Uses a **FIFO queue**. Explores all cells at distance *d* before any cell at distance *d+1*.

✅ **Guarantees shortest path** (minimum number of steps).

**Key insight:** BFS naturally finds shortest paths on unweighted graphs because it expands by layers.

---

### 3. Depth-First Search (DFS)  `O(N²)` time · `O(N²)` space
Uses an explicit **LIFO stack** (iterative, no recursion limit). Dives as deep as possible before backtracking. **Does not guarantee shortest path.**

**Key insight:** DFS uses less memory than BFS in sparse graphs (stack vs full frontier).

---

### 4. Dijkstra's Algorithm  `O(N² log N)` time · `O(N²)` space
Priority-queue based expansion — always expands the unvisited cell with the **smallest known distance**. All edge weights = 1 here, but generalises to weighted graphs.

✅ **Guarantees shortest path** on weighted graphs.

**Key insight:** Dijkstra = BFS generalised to arbitrary weights. On unweighted grids, behaves identically to BFS.

---

### 5. A* (A-Star)  `O(N²)` worst-case · `O(N²)` space
Combines Dijkstra's cost-so-far with a **heuristic** estimate of remaining distance:

```
f(n) = g(n) + h(n)
       ↑         ↑
  actual cost   Manhattan distance to goal
```

**Heuristic:** Manhattan Distance `h(r,c) = |goal_r - r| + |goal_c - c|`

This heuristic is *admissible* (never overestimates), so A* finds the **optimal path** while visiting **fewer cells** than BFS/Dijkstra.

✅ **Optimal** + **most efficient** for grid pathfinding.

---

## 🎮 Features

| Feature | Details |
|---|---|
| 5 algorithms | Backtracking, BFS, DFS, Dijkstra, A* |
| 4 maze sizes | 8×8, 12×12, 16×16, 20×20 |
| Draw walls | Click/drag on any cell |
| Clear walls | "Clear All Walls" → draw your own maze |
| Animation speed | 10-level slider |
| Live stats | Visited cells, path length, time, backtracks |
| Responsive | Works on mobile & desktop |

---

## 📊 Complexity Comparison

| Algorithm | Time | Space | Shortest Path? | Informed? |
|---|---|---|---|---|
| Backtracking | O(2^N²) | O(N²) | ❌ | ❌ |
| DFS | O(N²) | O(N²) | ❌ | ❌ |
| BFS | O(N²) | O(N²) | ✅ | ❌ |
| Dijkstra | O(N² log N) | O(N²) | ✅ | ❌ |
| A* | O(N²) | O(N²) | ✅ | ✅ |

---

## 🔧 Tech Stack

- **Vanilla HTML / CSS / JavaScript** — no frameworks, no build tools
- **Canvas API** — hardware-accelerated 2-D rendering
- **Space Grotesk + JetBrains Mono** — Google Fonts
- **Recursive DFS maze generator** — produces perfect mazes

---

## 💡 Learning Outcomes

1. Understand the difference between uninformed (BFS, DFS) and informed (A*) search
2. Visualise how backtracking explores and *unexclores* dead ends
3. See why A* visits dramatically fewer cells than BFS on the same maze
4. Grasp the trade-off between optimality, completeness, and efficiency

---

*DAA Project — 2024*
