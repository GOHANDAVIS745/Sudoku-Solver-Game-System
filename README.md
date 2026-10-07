# 🧩 Object-Oriented Sudoku Solver (C++ & Web Interface)

A complete Object-Oriented Programming (OOP) Sudoku engine built in modern C++ and integrated with an interactive web browser UI.

---

## 🔄 End-to-End Workflow

### 1. Implementation Pipeline

1. **Domain Modeling (C++):** Construct atomic `Cell` entities and aggregate `Board` validation logic. Test directly via CLI.
2. **Algorithm Engine (C++):** Implement depth-first recursive backtracking using an abstract `SudokuSolver` interface.
3. **Frontend UI (Web):** Create a 9x9 CSS grid with input constraints and keyboard controls.
4. **Bridge Integration:** Connect the C++ solver to the browser via WebAssembly (offline execution) or a local HTTP REST service.
5. **Validation & State Sync:** Parse results, highlight solved cells, and handle unsolvable boards gracefully.

---

## 📐 OOP Design Principles Applied

| Principle | Class / Component | Purpose |
| :--- | :--- | :--- |
| **Encapsulation** | `Cell`, `Board` | Internal state (values, 2D arrays) is private; mutations are strictly validated via accessors. |
| **Abstraction** | `SudokuSolver` | Defines a clean contract via pure virtual `solve(Board&)` without exposing implementation details. |
| **Polymorphism** | `BacktrackingSolver` | Implements the solver interface (Strategy Pattern), allowing alternative algorithms to be swapped in easily. |
| **Separation of Concerns** | Full Architecture | `Cell` holds data, `Board` checks rules, `Solver` executes algorithms, and Web UI renders visuals. |


---

## 🗺️ Step-by-Step Milestones

### Phase 1: Core Domain (C++)
- [ ] Implement `Cell` with value limits (0 to 9) and fixed-state indicators.
- [ ] Implement `Board` storing an 81-cell matrix.
- [ ] Implement placement verification rules:
  - Row uniqueness
  - Column uniqueness
  - 3x3 box uniqueness:
    - `startRow = r - (r % 3)`
    - `startCol = c - (c % 3)`
- [ ] Test the domain layer locally using `main.cpp`.

### Phase 2: Solver Algorithm (C++)
- [ ] Define the abstract `SudokuSolver` class.
- [ ] Implement recursive `BacktrackingSolver::solve(Board& board)`:
  - Search for empty cells (`value == 0`).
  - Iterate candidates 1 through 9.
  - Place valid candidate, recurse, and backtrack if dead end is hit.
- [ ] Validate against easy, medium, and edge-case unsolvable boards.

### Phase 3: Web Presentation
- [ ] Build a 9x9 grid layout using CSS Grid.
- [ ] Format visual 3x3 block borders with thick divider lines.
- [ ] Constrain inputs to single digits 1 to 9 with arrow-key navigation.
- [ ] Provide `Solve`, `Clear`, and `Reset` controls.

### Phase 4: Integration Bridge
Choose one integration route:
* **Option A: WebAssembly (Wasm via Emscripten)**
  - Compile C++ code into `.wasm` and `.js` using Emscripten `embind`.
  - Execute natively in the user's browser with no server required.
* **Option B: REST API (Crow C++)**
  - Run C++ locally as a lightweight HTTP microservice on port 8080.
  - Send board states from JavaScript using `fetch()`.

### Phase 5: Verification & Polish
- [ ] Highlight user inputs vs. solver-generated numbers.
- [ ] Return visual alerts on malformed or unsolvable starting inputs.
- [ ] Verify memory management and clean execution.

---

## 🛠️ Local Build & Run (CLI Test)

### Prerequisites
* A C++17 compatible compiler (`g++` or `clang++`)

### Compilation & Execution
```bash
# Compile CLI test
g++ -std=c++17 core/*.cpp -o sudoku_cli

# Run local test
./sudoku_cli
```
