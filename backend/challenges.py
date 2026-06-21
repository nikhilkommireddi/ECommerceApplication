"""
challenges.py — the algorithm catalog.

Each challenge defines what the learner sees and how their code is graded:
  id, name, category, difficulty, blurb, hints[]
  fn_name      the function the learner must implement
  starter      starter code shown in the editor
  solution     a reference solution (used to sanity-check tests, not shown)
  tests[]      {name, args, expected, check, edge?}
               check ∈ exact | sorted | count | hanoi | tour | path | xor

`check` tells the runner how to validate the returned value (some algorithms
can't be graded by simple equality — e.g. a Hanoi move list or a TSP tour).
"""

CHALLENGES = [
    # --------------------------------------------------------------------- #
    {
        "id": "sorting",
        "name": "Sorting",
        "category": "Foundations",
        "difficulty": "Easy",
        "blurb": "Order a list of numbers ascending. Watch comparisons and swaps "
                 "animate bar-by-bar, then implement your own sort.",
        "hints": [
            "Return a NEW sorted list (or sort in place and return it).",
            "Handle the empty list and a single element — they're already sorted.",
            "Duplicates must be kept (a stable result is fine).",
            "Bubble/selection are O(n²); merge/quick are O(n log n).",
        ],
        "fn_name": "sort",
        "starter": "def sort(nums):\n    # Return nums sorted in ascending order.\n    # Try implementing it yourself instead of using sorted()!\n    result = list(nums)\n    # your code here\n    return result\n",
        "solution": "def sort(nums):\n    a = list(nums)\n    for i in range(len(a)):\n        for j in range(len(a)-1-i):\n            if a[j] > a[j+1]:\n                a[j], a[j+1] = a[j+1], a[j]\n    return a\n",
        "tests": [
            {"name": "basic", "args": [[5, 2, 9, 1, 5, 6]], "check": "sorted"},
            {"name": "already sorted", "args": [[1, 2, 3, 4]], "check": "sorted"},
            {"name": "reverse", "args": [[9, 7, 5, 3, 1]], "check": "sorted"},
            {"name": "duplicates", "args": [[4, 4, 4, 2, 2, 8]], "check": "sorted"},
            {"name": "negatives", "args": [[-3, 10, -7, 0, 5]], "check": "sorted"},
            {"name": "edge: empty", "args": [[]], "check": "sorted", "edge": True},
            {"name": "edge: single", "args": [[42]], "check": "sorted", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "searching",
        "name": "Binary Search",
        "category": "Foundations",
        "difficulty": "Easy",
        "blurb": "Find a target in a sorted array in O(log n) by repeatedly halving "
                 "the search window. Return the index, or -1 if absent.",
        "hints": [
            "The array is already sorted ascending.",
            "Keep two pointers lo and hi; compare against the middle element.",
            "Return -1 when the target isn't present — don't forget this edge case.",
            "mid = (lo + hi) // 2 avoids overflow in other languages.",
        ],
        "fn_name": "search",
        "starter": "def search(nums, target):\n    # Return the index of target in the sorted list nums, or -1.\n    lo, hi = 0, len(nums) - 1\n    # your code here\n    return -1\n",
        "solution": "def search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n",
        "tests": [
            {"name": "found middle", "args": [[1, 3, 5, 7, 9], 5], "expected": 2, "check": "exact"},
            {"name": "found first", "args": [[1, 3, 5, 7, 9], 1], "expected": 0, "check": "exact"},
            {"name": "found last", "args": [[1, 3, 5, 7, 9], 9], "expected": 4, "check": "exact"},
            {"name": "absent", "args": [[1, 3, 5, 7, 9], 4], "expected": -1, "check": "exact"},
            {"name": "edge: empty", "args": [[], 3], "expected": -1, "check": "exact", "edge": True},
            {"name": "edge: single hit", "args": [[7], 7], "expected": 0, "check": "exact", "edge": True},
            {"name": "edge: single miss", "args": [[7], 2], "expected": -1, "check": "exact", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "dijkstra",
        "name": "Dijkstra",
        "category": "Graphs & Pathfinding",
        "difficulty": "Medium",
        "blurb": "Shortest path on a weighted grid with non-negative costs. Expand the "
                 "closest unvisited node first using a priority queue.",
        "hints": [
            "grid[r][c] is the cost to ENTER that cell; move 4-directionally.",
            "Use a min-heap of (distance, row, col); pop the smallest each step.",
            "Keep a visited set so you never relax a finalized node again.",
            "Return the total cost from top-left to bottom-right (include both).",
            "Edge: a 1×1 grid's answer is just that single cell's cost.",
        ],
        "fn_name": "shortest_path",
        "starter": "import heapq\n\ndef shortest_path(grid):\n    # grid[r][c] = cost to enter cell. Move up/down/left/right.\n    # Return the minimum total cost from (0,0) to bottom-right.\n    R, C = len(grid), len(grid[0])\n    # your code here\n    return 0\n",
        "solution": "import heapq\n\ndef shortest_path(grid):\n    R, C = len(grid), len(grid[0])\n    dist = [[float('inf')]*C for _ in range(R)]\n    dist[0][0] = grid[0][0]\n    pq = [(grid[0][0], 0, 0)]\n    while pq:\n        d, r, c = heapq.heappop(pq)\n        if d > dist[r][c]:\n            continue\n        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n            nr, nc = r+dr, c+dc\n            if 0 <= nr < R and 0 <= nc < C:\n                nd = d + grid[nr][nc]\n                if nd < dist[nr][nc]:\n                    dist[nr][nc] = nd\n                    heapq.heappush(pq, (nd, nr, nc))\n    return dist[R-1][C-1]\n",
        "tests": [
            {"name": "3x3 uniform", "args": [[[1,1,1],[1,1,1],[1,1,1]]], "expected": 5, "check": "exact"},
            {"name": "weighted", "args": [[[1,3,1],[1,5,1],[4,2,1]]], "expected": 7, "check": "exact"},
            {"name": "avoid wall", "args": [[[1,9,1],[1,9,1],[1,1,1]]], "expected": 5, "check": "exact"},
            {"name": "edge: 1x1", "args": [[[5]]], "expected": 5, "check": "exact", "edge": True},
            {"name": "edge: single row", "args": [[[1,2,3,4]]], "expected": 10, "check": "exact", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "astar",
        "name": "A* Search",
        "category": "Graphs & Pathfinding",
        "difficulty": "Medium",
        "blurb": "Dijkstra with a heuristic. Cells marked 1 are walls. Find the fewest "
                 "steps from start to goal, guided toward the target.",
        "hints": [
            "0 = open, 1 = wall. Move 4-directionally, each step costs 1.",
            "f(n) = g(n) + h(n); use Manhattan distance to the goal as h.",
            "A* with an admissible heuristic still returns the optimal path length.",
            "Return -1 if the goal is unreachable.",
        ],
        "fn_name": "astar",
        "starter": "import heapq\n\ndef astar(grid, start, goal):\n    # grid[r][c]: 0 open, 1 wall. start/goal are (row, col).\n    # Return the fewest steps from start to goal, or -1 if blocked.\n    # your code here\n    return -1\n",
        "solution": "import heapq\n\ndef astar(grid, start, goal):\n    R, C = len(grid), len(grid[0])\n    (sr, sc), (gr, gc) = start, goal\n    if grid[sr][sc] or grid[gr][gc]:\n        return -1\n    def h(r, c):\n        return abs(r-gr) + abs(c-gc)\n    g = {(sr, sc): 0}\n    pq = [(h(sr, sc), 0, sr, sc)]\n    seen = set()\n    while pq:\n        f, cost, r, c = heapq.heappop(pq)\n        if (r, c) in seen:\n            continue\n        seen.add((r, c))\n        if (r, c) == (gr, gc):\n            return cost\n        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n            nr, nc = r+dr, c+dc\n            if 0 <= nr < R and 0 <= nc < C and not grid[nr][nc]:\n                ng = cost + 1\n                if ng < g.get((nr, nc), 1e9):\n                    g[(nr, nc)] = ng\n                    heapq.heappush(pq, (ng + h(nr, nc), ng, nr, nc))\n    return -1\n",
        "tests": [
            {"name": "open 3x3", "args": [[[0,0,0],[0,0,0],[0,0,0]], [0,0], [2,2]], "expected": 4, "check": "exact"},
            {"name": "around wall", "args": [[[0,1,0],[0,1,0],[0,0,0]], [0,0], [0,2]], "expected": 6, "check": "exact"},
            {"name": "blocked", "args": [[[0,1,0],[0,1,0],[0,1,0]], [0,0], [0,2]], "expected": -1, "check": "exact", "edge": True},
            {"name": "edge: start==goal", "args": [[[0,0],[0,0]], [0,0], [0,0]], "expected": 0, "check": "exact", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "nqueens",
        "name": "N-Queens",
        "category": "Backtracking",
        "difficulty": "Medium",
        "blurb": "Place N queens on an N×N board so none attack each other. Count the "
                 "distinct solutions — and watch backtracking prune the search.",
        "hints": [
            "Place one queen per row; recurse to the next row.",
            "A column/diagonal is safe if no queen shares col, r-c, or r+c.",
            "Track used columns and both diagonals with sets for O(1) checks.",
            "n=1 has 1 solution; n=2 and n=3 have 0.",
        ],
        "fn_name": "count_nqueens",
        "starter": "def count_nqueens(n):\n    # Return the number of distinct solutions to the N-Queens puzzle.\n    cols, diag1, diag2 = set(), set(), set()\n    # your code here\n    return 0\n",
        "solution": "def count_nqueens(n):\n    cols, d1, d2 = set(), set(), set()\n    def place(r):\n        if r == n:\n            return 1\n        total = 0\n        for c in range(n):\n            if c in cols or (r-c) in d1 or (r+c) in d2:\n                continue\n            cols.add(c); d1.add(r-c); d2.add(r+c)\n            total += place(r+1)\n            cols.remove(c); d1.remove(r-c); d2.remove(r+c)\n        return total\n    return place(0)\n",
        "tests": [
            {"name": "n=4", "args": [4], "expected": 2, "check": "exact"},
            {"name": "n=5", "args": [5], "expected": 10, "check": "exact"},
            {"name": "n=6", "args": [6], "expected": 4, "check": "exact"},
            {"name": "n=8", "args": [8], "expected": 92, "check": "exact"},
            {"name": "edge: n=1", "args": [1], "expected": 1, "check": "exact", "edge": True},
            {"name": "edge: n=2 (none)", "args": [2], "expected": 0, "check": "exact", "edge": True},
            {"name": "edge: n=3 (none)", "args": [3], "expected": 0, "check": "exact", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "hanoi",
        "name": "Tower of Hanoi",
        "category": "Recursion",
        "difficulty": "Easy",
        "blurb": "Move a stack of n disks from peg A to C, never putting a larger disk "
                 "on a smaller one. Return the optimal sequence of moves.",
        "hints": [
            "Move n-1 disks A→B, move the big disk A→C, then n-1 disks B→C.",
            "Each move is a tuple (from_peg, to_peg) using 'A', 'B', 'C'.",
            "The optimal solution has exactly 2ⁿ − 1 moves.",
            "Edge: n=0 returns an empty list of moves.",
        ],
        "fn_name": "hanoi",
        "starter": "def hanoi(n, src='A', aux='B', dst='C'):\n    # Return a list of (from, to) moves solving Tower of Hanoi.\n    moves = []\n    # your code here\n    return moves\n",
        "solution": "def hanoi(n, src='A', aux='B', dst='C'):\n    moves = []\n    def solve(k, s, a, d):\n        if k == 0:\n            return\n        solve(k-1, s, d, a)\n        moves.append((s, d))\n        solve(k-1, a, s, d)\n    solve(n, src, aux, dst)\n    return moves\n",
        "tests": [
            {"name": "n=1", "args": [1], "check": "hanoi"},
            {"name": "n=2", "args": [2], "check": "hanoi"},
            {"name": "n=3", "args": [3], "check": "hanoi"},
            {"name": "n=5", "args": [5], "check": "hanoi"},
            {"name": "edge: n=0", "args": [0], "check": "hanoi", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "tsp",
        "name": "Travelling Salesman",
        "category": "Optimization",
        "difficulty": "Hard",
        "blurb": "Visit every city once and return home with the shortest tour. Implement "
                 "the nearest-neighbour heuristic and watch the route form.",
        "hints": [
            "points is a list of (x, y). Start the tour at city 0.",
            "Repeatedly hop to the nearest unvisited city.",
            "Return a permutation of all indices, each exactly once, starting at 0.",
            "The visualizer also runs 2-opt to refine — yours just needs a valid tour.",
        ],
        "fn_name": "tsp_tour",
        "starter": "import math\n\ndef tsp_tour(points):\n    # points: list of (x, y). Return a visiting order (list of indices)\n    # starting at 0 that visits every city exactly once.\n    n = len(points)\n    # your code here\n    return list(range(n))\n",
        "solution": "import math\n\ndef tsp_tour(points):\n    n = len(points)\n    if n == 0:\n        return []\n    def d(a, b):\n        return math.dist(points[a], points[b])\n    tour = [0]\n    unvisited = set(range(1, n))\n    while unvisited:\n        last = tour[-1]\n        nxt = min(unvisited, key=lambda c: d(last, c))\n        tour.append(nxt)\n        unvisited.remove(nxt)\n    return tour\n",
        "tests": [
            {"name": "square", "args": [[[0,0],[0,1],[1,1],[1,0]]], "check": "tour"},
            {"name": "5 cities", "args": [[[0,0],[2,3],[5,1],[6,4],[1,5]]], "check": "tour"},
            {"name": "line", "args": [[[0,0],[1,0],[2,0],[3,0]]], "check": "tour"},
            {"name": "edge: single city", "args": [[[0,0]]], "check": "tour", "edge": True},
            {"name": "edge: two cities", "args": [[[0,0],[3,4]]], "check": "tour", "edge": True},
        ],
    },
    # --------------------------------------------------------------------- #
    {
        "id": "backprop",
        "name": "Backpropagation ✨",
        "category": "Neural Networks",
        "difficulty": "Hard",
        "blurb": "The special one. Train a tiny 2-2-1 neural network to learn XOR using "
                 "gradient descent. Watch the loss fall and the decision surface sharpen.",
        "hints": [
            "Implement train_xor(epochs, lr) returning the final MSE loss (a float).",
            "Forward: h = sigmoid(X·W1 + b1); out = sigmoid(h·W2 + b2).",
            "Backprop the error: dL/dout · sigmoid'(out), then chain back to W1.",
            "sigmoid'(x) = s(x)·(1 − s(x)). Update weights by −lr · gradient.",
            "With enough epochs (e.g. 5000) the loss should drop well below 0.05.",
        ],
        "fn_name": "train_xor",
        "starter": "import math, random\n\ndef sigmoid(x):\n    return 1 / (1 + math.exp(-x))\n\ndef train_xor(epochs=5000, lr=0.5):\n    # Train a 2-2-1 net on XOR. Return the final mean-squared-error loss.\n    random.seed(1)\n    X = [(0,0),(0,1),(1,0),(1,1)]\n    Y = [0, 1, 1, 0]\n    # initialise weights, then loop: forward -> loss -> backprop -> update\n    # your code here\n    return 1.0\n",
        "solution": "import math, random\n\ndef sigmoid(x):\n    return 1 / (1 + math.exp(-x))\n\ndef train_xor(epochs=5000, lr=0.5):\n    random.seed(1)\n    X = [(0,0),(0,1),(1,0),(1,1)]\n    Y = [0, 1, 1, 0]\n    W1 = [[random.uniform(-1,1) for _ in range(2)] for _ in range(2)]\n    b1 = [random.uniform(-1,1) for _ in range(2)]\n    W2 = [random.uniform(-1,1) for _ in range(2)]\n    b2 = random.uniform(-1,1)\n    loss = 1.0\n    for _ in range(epochs):\n        loss = 0.0\n        for (x0, x1), y in zip(X, Y):\n            h_in = [x0*W1[0][j] + x1*W1[1][j] + b1[j] for j in range(2)]\n            h = [sigmoid(v) for v in h_in]\n            o_in = h[0]*W2[0] + h[1]*W2[1] + b2\n            o = sigmoid(o_in)\n            err = o - y\n            loss += err*err\n            do = err * o * (1 - o)\n            dW2 = [do*h[0], do*h[1]]\n            dh = [do*W2[j]*h[j]*(1-h[j]) for j in range(2)]\n            for j in range(2):\n                W2[j] -= lr*dW2[j]\n            b2 -= lr*do\n            for i, xi in enumerate((x0, x1)):\n                for j in range(2):\n                    W1[i][j] -= lr*dh[j]*xi\n            for j in range(2):\n                b1[j] -= lr*dh[j]\n        loss /= len(X)\n    return loss\n",
        "tests": [
            {"name": "learns XOR (loss < 0.05)", "args": [6000, 0.5], "check": "xor"},
            {"name": "improves over baseline", "args": [3000, 0.5], "check": "xor_loose"},
        ],
    },
]

BY_ID = {c["id"]: c for c in CHALLENGES}


def catalog():
    """Lightweight list for the sidebar (no solutions)."""
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "category": c["category"],
            "difficulty": c["difficulty"],
            "blurb": c["blurb"],
            "hints": c["hints"],
            "fn_name": c["fn_name"],
            "starter": c["starter"],
            "tests": len(c["tests"]),
        }
        for c in CHALLENGES
    ]
