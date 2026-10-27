const gridContainer = document.getElementById("sudoku-grid");
const statusMsg = document.getElementById("status-message");

let sudokuModule = null;
let currentOriginalPuzzle = "0".repeat(81); // Tracks puzzle for the Reset button

// Initialize WebAssembly
createSudokuModule().then(module => {
  sudokuModule = module;
  statusMsg.textContent = "C++ Solver engine loaded and ready.";
  statusMsg.style.color = "#16a34a";
}).catch(err => console.error(err));

function createGrid() {
  gridContainer.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.classList.add("cell");
    input.dataset.index = i;

    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeyNavigation);

    gridContainer.appendChild(input);
  }
}

// Check for real-time conflicts
function checkRealTimeConflicts() {
  const currentBoard = getBoardString();
  if (!isValidBoardState(currentBoard)) {
    gridContainer.classList.add("error-state");
  } else {
    gridContainer.classList.remove("error-state");
  }
}

function handleInput(e) {
  const value = e.target.value;
  if (!/^[1-9]$/.test(value)) {
    e.target.value = "";
  } else {
    e.target.classList.remove("solved");
  }
  checkRealTimeConflicts(); // Turn red immediately if wrong!
}

function handleKeyNavigation(e) {
  const currentIndex = parseInt(e.target.dataset.index, 10);
  const row = Math.floor(currentIndex / 9);
  const col = currentIndex % 9;
  let targetIndex = null;

  switch (e.key) {
    case "ArrowUp": if (row > 0) targetIndex = currentIndex - 9; break;
    case "ArrowDown": if (row < 8) targetIndex = currentIndex + 9; break;
    case "ArrowLeft": if (col > 0) targetIndex = currentIndex - 1; break;
    case "ArrowRight": if (col < 8) targetIndex = currentIndex + 1; break;
    case "Backspace": 
      // Only allow backspace if cell is NOT read-only
      if (!e.target.readOnly) {
        e.target.value = ""; 
        checkRealTimeConflicts(); // Remove red state if fixed
      }
      break;
  }

  if (targetIndex !== null) {
    e.preventDefault();
    gridContainer.children[targetIndex]?.focus();
  }
}

function getBoardString() {
  const cells = gridContainer.querySelectorAll(".cell");
  let result = "";
  cells.forEach(cell => result += (cell.value ? cell.value : "0"));
  return result;
}

function setBoardString(boardStr, markAsGiven = false) {
  const cells = gridContainer.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    const val = boardStr[i] || "0";
    if (val !== "0") {
      cells[i].value = val;
      cells[i].className = "cell " + (markAsGiven ? "given" : "solved");
      
      // STRICT LOCK: Prevents user from editing question clues
      cells[i].readOnly = markAsGiven; 
    } else {
      cells[i].value = "";
      cells[i].className = "cell";
      cells[i].readOnly = false; // Unlock empty cells
    }
  }
  checkRealTimeConflicts();
}

function isValidBoardState(boardStr) {
  for (let i = 0; i < 81; i++) {
    let val = boardStr[i];
    if (val === "0") continue;
    
    let row = Math.floor(i / 9);
    let col = i % 9;
    
    // Check ahead for duplicates
    for (let j = i + 1; j < 81; j++) {
      if (boardStr[j] === val) {
        let r2 = Math.floor(j / 9);
        let c2 = j % 9;
        if (row === r2 || col === c2 || (Math.floor(row/3) === Math.floor(r2/3) && Math.floor(col/3) === Math.floor(c2/3))) {
          return false; // Duplicate found
        }
      }
    }
  }
  return true;
}

// ==========================================
// Button & Modal Event Listeners
// ==========================================

document.getElementById("clear-btn").addEventListener("click", () => {
  gridContainer.querySelectorAll(".cell").forEach(cell => {
    cell.value = "";
    cell.className = "cell";
    cell.readOnly = false;
  });
  currentOriginalPuzzle = "0".repeat(81);
  gridContainer.classList.remove("error-state", "shake");
  statusMsg.textContent = "Grid completely cleared.";
  statusMsg.style.color = "#64748b";
});

// RESTORE BUTTON: Works perfectly by referencing the locked baseline
document.getElementById("reset-btn").addEventListener("click", () => {
  setBoardString(currentOriginalPuzzle, true);
  statusMsg.textContent = "Puzzle reset to original state.";
  statusMsg.style.color = "#64748b";
});

document.getElementById("solve-btn").addEventListener("click", () => {
  if (!sudokuModule) return;
  const currentBoard = getBoardString();

  if (!isValidBoardState(currentBoard)) {
    gridContainer.classList.add("error-state", "shake");
    statusMsg.textContent = "Invalid board: Fix conflicting numbers first!";
    statusMsg.style.color = "#dc2626";
    setTimeout(() => gridContainer.classList.remove("shake"), 400);
    return;
  }

  const startTime = performance.now();
  const solution = sudokuModule.solvePuzzle(currentBoard);
  const timeTaken = (performance.now() - startTime).toFixed(2);

  if (solution && solution.length === 81) {
    const cells = gridContainer.querySelectorAll(".cell");
    for (let i = 0; i < 81; i++) {
      if (!cells[i].value) {
        cells[i].value = solution[i];
        cells[i].classList.add("solved");
      }
    }
    statusMsg.textContent = `Solved in ${timeTaken} ms!`;
    statusMsg.style.color = "#16a34a";
  } else {
    gridContainer.classList.add("error-state", "shake");
    statusMsg.textContent = "This puzzle is unsolvable!";
    statusMsg.style.color = "#dc2626";
    setTimeout(() => gridContainer.classList.remove("shake"), 400);
  }
});

// Modal Logic
const difficultyModal = document.getElementById("difficulty-modal");
document.getElementById("open-generate-btn").addEventListener("click", () => difficultyModal.showModal());
document.getElementById("cancel-btn").addEventListener("click", () => difficultyModal.close());

document.getElementById("proceed-btn").addEventListener("click", () => {
  if (!sudokuModule) return;
  const difficulty = parseInt(document.querySelector('input[name="difficulty"]:checked').value);
  const puzzleString = sudokuModule.generatePuzzle(difficulty);
  
  // Save baseline for the Reset button
  currentOriginalPuzzle = puzzleString; 
  
  // Apply to board (locks cells automatically)
  setBoardString(puzzleString, true);
  
  const diffName = difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard";
  statusMsg.textContent = `Generated new ${diffName} puzzle.`;
  statusMsg.style.color = "#64748b";
  difficultyModal.close();
});

// Initialize
createGrid();

let lastFocusedIndex = -1;

// Track focused cell in createGrid()
function createGrid() {
  gridContainer.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.classList.add("cell");
    input.dataset.index = i;

    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeyNavigation);
    input.addEventListener("focus", (e) => {
      lastFocusedIndex = parseInt(e.target.dataset.index, 10);
    });

    gridContainer.appendChild(input);
  }
}

// Remove hint styling if the user edits the cell
function handleInput(e) {
  const value = e.target.value;
  if (!/^[1-9]$/.test(value)) {
    e.target.value = "";
  } else {
    e.target.classList.remove("solved", "hint");
  }
  checkRealTimeConflicts();
}

// Hint Button Click Handler
document.getElementById("hint-btn").addEventListener("click", () => {
  if (!sudokuModule) return;
  const currentBoard = getBoardString();

  // Validate board before solving
  if (!isValidBoardState(currentBoard)) {
    gridContainer.classList.add("error-state", "shake");
    statusMsg.textContent = "Conflicting numbers detected. Fix errors before requesting a hint!";
    statusMsg.style.color = "#dc2626";
    setTimeout(() => gridContainer.classList.remove("shake"), 400);
    return;
  }

  if (!currentBoard.includes("0")) {
    statusMsg.textContent = "The board is already filled!";
    statusMsg.style.color = "#16a34a";
    return;
  }

  // Pass focused index if empty, or -1 for random
  const preferred = (lastFocusedIndex >= 0 && currentBoard[lastFocusedIndex] === "0") 
    ? lastFocusedIndex 
    : -1;

// 1. Solve the board using the pre-compiled C++ WebAssembly function
const solvedBoard = sudokuModule.solvePuzzle(currentBoard);

if (!solvedBoard || solvedBoard.length !== 81) {
  statusMsg.textContent = "No valid solution exists from this board state.";
  statusMsg.style.color = "#dc2626";
  return;
}

// 2. Pick the empty cell to reveal (prioritize the focused cell if empty)
let targetIndex = -1;
if (lastFocusedIndex >= 0 && lastFocusedIndex < 81 && currentBoard[lastFocusedIndex] === "0") {
  targetIndex = lastFocusedIndex;
} else {
  const emptyIndices = [];
  for (let i = 0; i < 81; i++) {
    if (currentBoard[i] === "0") emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) return;
  targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// 3. Reveal only that single square
const targetCell = gridContainer.children[targetIndex];
const correctDigit = solvedBoard[targetIndex];

if (targetCell) {
  targetCell.value = correctDigit;
  targetCell.classList.add("hint");
  targetCell.focus();
  checkRealTimeConflicts();

  const row = Math.floor(targetIndex / 9) + 1;
  const col = (targetIndex % 9) + 1;
  statusMsg.textContent = `💡 Hint: Placed ${correctDigit} at Row ${row}, Column ${col}.`;
  statusMsg.style.color = "#d97706";
}

  if (targetCell) {
    targetCell.value = valStr;
    targetCell.classList.add("hint");
    targetCell.focus();
    checkRealTimeConflicts();

    const row = Math.floor(targetIndex / 9) + 1;
    const col = (targetIndex % 9) + 1;
    statusMsg.textContent = `Hint: Placed ${valStr} at Row ${row}, Column ${col}.`;
    statusMsg.style.color = "#d97706";
  }
});