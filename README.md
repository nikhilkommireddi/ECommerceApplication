# ∿ Algoscope

**See it. Code it. Run it.** An interactive algorithm playground where you
**watch** classic algorithms animate step-by-step, then **implement them yourself**
in an in-browser editor and **run your code against real test + edge cases** with
contextual **hints** on failure. React + Flask + SQLite.

> Eight algorithms, each with an animated visualizer **and** a graded coding
> challenge — including **Backpropagation**: train a tiny neural net on XOR and
> watch the loss fall and the decision surface sharpen.

---

## 🧠 What's inside

| Category | Algorithm | Visualize | Code & test |
|----------|-----------|-----------|-------------|
| Foundations | **Sorting** (bubble · selection · insertion · merge · quick) | animated bars | implement `sort` |
| Foundations | **Binary Search** | shrinking lo/hi/mid window | implement `search` |
| Pathfinding | **Dijkstra** | grid flood-fill, draw walls | weighted-grid shortest cost |
| Pathfinding | **A\*** | heuristic-guided expansion | maze shortest path |
| Backtracking | **N-Queens** | live place / backtrack | count solutions |
| Recursion | **Tower of Hanoi** | disks moving between pegs | return the optimal moves |
| Optimization | **Travelling Salesman** | nearest-neighbour + 2-opt | build a valid tour |
| Neural Networks | **Backpropagation ✨** | weights · loss curve · decision surface | train XOR to low loss |

Each visualizer has a transport bar (play / pause / step / scrub / speed) and live
controls. The coding playground marks **edge cases**, saves progress to SQLite,
and runs your Python in a **subprocess with an 8s timeout** (so infinite loops are
caught, not hung).

---

## 🛠 Tech stack

| Layer | What we used |
|-------|--------------|
| **Frontend** | React 18, Vite — custom SVG/grid visualizers + a dependency-free code editor |
| **Backend** | Python 3, Flask, Flask-CORS |
| **Database** | SQLite (Python stdlib) — `backend/algo.db` (saved code + progress) |
| **Code grading** | user code run in an isolated `subprocess` with a wall-clock timeout |

---

## 📁 Project structure

```
Algoscope/  (folder: AlgoVisualizer)
├── backend/
│   ├── app.py             # Flask API: /algorithms, /run (grading), /progress
│   ├── challenges.py      # the catalog: blurbs, hints, starter code, tests (incl. edge cases)
│   ├── runner.py          # subprocess harness that executes + grades a submission
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js     # dev proxy /api → :5004
    ├── package.json
    └── src/
        ├── App.jsx        # sidebar catalog + Visualize / Code tabs
        ├── api.js
        ├── index.css
        ├── hooks/useStepPlayer.js     # drives frame-by-frame animation
        ├── components/
        │   ├── PlayerBar.jsx          # shared transport controls
        │   ├── CodeEditor.jsx         # line-numbered editor
        │   └── CodePlayground.jsx     # run → results + hints
        └── viz/                       # one visualizer per algorithm
            ├── SortingViz · SearchingViz · PathfindingViz (Dijkstra/A*)
            ├── NQueensViz · HanoiViz · TSPViz
            └── BackpropViz.jsx        # the neural-net training visualizer
```

---

## 🚀 Getting started

**1. Backend (Flask + SQLite)**
```bash
cd AlgoVisualizer/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # API on http://localhost:5004
```

**2. Frontend (React + Vite)**
```bash
cd AlgoVisualizer/frontend
npm install
npm run dev              # http://localhost:5180  (proxies /api → :5004)
```

Open **http://localhost:5180**, pick an algorithm, watch it animate, then switch
to **Code & test** and implement it yourself.

**Production** — `cd frontend && npm run build`, then `python app.py` serves the
built app from Flask at `:5004`.

---

## 🔌 API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Status |
| `GET` | `/api/algorithms` | Catalog: blurb, hints, starter code, saved progress |
| `POST` | `/api/run` | `{id, code}` → per-case results, hint, solved flag |
| `GET` | `/api/progress` | Saved progress for every algorithm |
| `POST` | `/api/reset/<id>` | Clear saved code for one algorithm |

> ⚠️ This executes the Python you type, in a subprocess with a timeout. It's a
> local, educational tool — run it on your own machine.

---

