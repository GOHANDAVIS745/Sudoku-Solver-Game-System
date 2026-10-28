/**
 * Sudoku Master Web Application
 * Two-Tier Decoupled Architecture (C++ WebAssembly + Vanilla JS)
 * Fully Defensive / Beginner-Safe Implementation
 */

// 1. Safe DOM Element References
const gridContainer = document.getElementById("sudoku-grid");
const statusMsg = document.getElementById("status-message");
const phoneKeypad = document.getElementById("phone-keypad");
const eraseBtn = document.getElementById("erase-btn");
const notesToggleBtn = document.getElementById("notes-toggle-btn");
const notesLabel = document.getElementById("notes-label");
const themeSelect = document.getElementById("theme-select");
const timerText = document.getElementById("timer-text");
const timerPauseBtn = document.getElementById("timer-pause-btn");

const openGenerateBtn = document.getElementById("open-generate-btn");
const hintBtn = document.getElementById("hint-btn");
const solveBtn = document.getElementById("solve-btn");
const resetBtn = document.getElementById("reset-btn");
const clearBtn = document.getElementById("clear-btn");
const difficultyModal = document.getElementById("difficulty-modal");
const proceedBtn = document.getElementById("proceed-btn");
const cancelBtn = document.getElementById("cancel-btn");

let isAutoSolved = false;
let sudokuModule = null;
let currentOriginalPuzzle = "0".repeat(81);
let selectedCellIndex = -1;
let isNotesMode = false;

// 81 sets to track candidate notes per cell
const cellNotes = Array.from({ length: 81 }, () => new Set());

// 2. WebAssembly Engine Initialization
if (typeof createSudokuModule === "function") {
  createSudokuModule().then(module => {
    sudokuModule = module;
    if (statusMsg) {
      statusMsg.textContent = "C++ Solver engine loaded and ready.";
      statusMsg.style.color = "var(--text-main)";
    }
  }).catch(err => {
    console.error("Wasm load error:", err);
    if (statusMsg) {
      statusMsg.textContent = "Failed to load C++ engine.";
      statusMsg.style.color = "#ef4444";
    }
  });
} else {
  console.warn("createSudokuModule is not defined yet. Ensure solver.js is included in index.html before app.js.");
}

// 3. Theme Selector (Ocean, Wood, Sky, Space, Nature, Dark, Light)
function applyTheme(themeName) {
  document.body.setAttribute("data-theme", themeName);
  try {
    localStorage.setItem("sudoku-theme-palette", themeName);
  } catch (e) {
    // Ignore storage restrictions
  }
  if (themeSelect) themeSelect.value = themeName;
}

let savedTheme = "ocean";
try {
  savedTheme = localStorage.getItem("sudoku-theme-palette") || "ocean";
} catch (e) {
  savedTheme = "ocean";
}
applyTheme(savedTheme);

if (themeSelect) {
  themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
}

// 4. Live Game Timer (Directly Above Keypad)
let timerInterval = null;
let secondsElapsed = 0;
let isTimerPaused = false;

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  isTimerPaused = false;
  if (timerText) timerText.textContent = "00:00";
  if (timerPauseBtn) timerPauseBtn.textContent = "⏸️";
  if (gridContainer) {
    gridContainer.style.filter = "none";
    gridContainer.style.pointerEvents = "auto";
  }

  timerInterval = setInterval(() => {
    if (!isTimerPaused) {
      secondsElapsed++;
      if (timerText) timerText.textContent = formatTime(secondsElapsed);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

if (timerPauseBtn) {
  timerPauseBtn.addEventListener("click", () => {
    isTimerPaused = !isTimerPaused;
    timerPauseBtn.textContent = isTimerPaused ? "▶️" : "⏸️";
    if (gridContainer) {
      gridContainer.style.filter = isTimerPaused ? "blur(4px)" : "none";
      gridContainer.style.pointerEvents = isTimerPaused ? "none" : "auto";
    }
    if (statusMsg) {
      statusMsg.textContent = isTimerPaused ? "Game paused." : "Game resumed.";
    }
  });
}

// 5. Grid Generation & 3x3 Notes Grid
function createGrid() {
  if (!gridContainer) return;
  gridContainer.innerHTML = "";

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.tabIndex = 0;

    const valSpan = document.createElement("span");
    valSpan.classList.add("cell-value");
    cell.appendChild(valSpan);

    const notesGrid = document.createElement("div");
    notesGrid.classList.add("notes-grid");
    for (let d = 1; d <= 9; d++) {
      const noteDigit = document.createElement("span");
      noteDigit.classList.add("note-digit", `note-${d}`);
      notesGrid.appendChild(noteDigit);
    }
    cell.appendChild(notesGrid);

    cell.addEventListener("click", () => {
      if (isTimerPaused) return;
      selectCell(i);
    });

    cell.addEventListener("keydown", handleKeyNavigation);

    gridContainer.appendChild(cell);
  }
}

function selectCell(index) {
  if (isTimerPaused || !gridContainer) return;
  selectedCellIndex = index;
  const cells = gridContainer.querySelectorAll(".cell");
  const targetCell = cells[index];
  if (!targetCell) return;

  const targetVal = getCellValue(targetCell);
  const targetRow = Math.floor(index / 9);
  const targetCol = index % 9;
  const targetBoxRow = Math.floor(targetRow / 3);
  const targetBoxCol = Math.floor(targetCol / 3);

  cells.forEach((cell, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const boxR = Math.floor(r / 3);
    const boxC = Math.floor(c / 3);
    const cellVal = getCellValue(cell);

    cell.classList.remove("selected", "highlight-related", "highlight-same-digit");

    if (idx === index) {
      cell.classList.add("selected");
    } else {
      if (r === targetRow || c === targetCol || (boxR === targetBoxRow && boxC === targetBoxCol)) {
        cell.classList.add("highlight-related");
      }
      if (targetVal && cellVal === targetVal) {
        cell.classList.add("highlight-same-digit");
      }
    }
  });

  targetCell.focus();
}

function getCellValue(cellElement) {
  if (!cellElement) return "";
  const span = cellElement.querySelector(".cell-value");
  return span ? span.textContent.trim() : "";
}

function setCellValue(cellElement, val, isGiven = false) {
  if (!cellElement) return;
  const valSpan = cellElement.querySelector(".cell-value");
  const notesGrid = cellElement.querySelector(".notes-grid");
  const index = parseInt(cellElement.dataset.index, 10);

  if (val && val !== "0") {
    if (valSpan) {
      valSpan.textContent = val;
      valSpan.style.display = "block";
    }
    if (notesGrid) notesGrid.style.display = "none";
  } else {
    if (valSpan) {
      valSpan.textContent = "";
      valSpan.style.display = "none";
    }
    if (notesGrid) notesGrid.style.display = "grid";
  }

  if (isGiven) {
    cellElement.classList.add("given");
  } else {
    cellElement.classList.remove("given");
  }

  if (!val || val === "0") {
    renderCellNotes(index);
  }
}

function toggleCellNote(cellIndex, digit) {
  if (!gridContainer) return;
  const cell = gridContainer.children[cellIndex];
  if (!cell || cell.classList.contains("given")) return;

  setCellValue(cell, "");
  cell.classList.remove("solved", "hint");

  const notesSet = cellNotes[cellIndex];
  if (notesSet.has(digit)) {
    notesSet.delete(digit);
  } else {
    notesSet.add(digit);
  }

  renderCellNotes(cellIndex);
}

function renderCellNotes(cellIndex) {
  if (!gridContainer) return;
  const cell = gridContainer.children[cellIndex];
  if (!cell) return;
  const notesGrid = cell.querySelector(".notes-grid");
  if (!notesGrid) return;
  const notesSet = cellNotes[cellIndex];

  for (let d = 1; d <= 9; d++) {
    const noteEl = notesGrid.querySelector(`.note-${d}`);
    if (noteEl) noteEl.textContent = notesSet.has(d) ? d : "";
  }
}

function clearCell(cellIndex) {
  if (isTimerPaused || !gridContainer) return;
  const cell = gridContainer.children[cellIndex];
  if (!cell || cell.classList.contains("given")) return;

  const val = getCellValue(cell);
  if (val) {
    setCellValue(cell, "");
  } else {
    cellNotes[cellIndex].clear();
    renderCellNotes(cellIndex);
  }
  cell.classList.remove("solved", "hint");
  selectCell(cellIndex);
  checkRealTimeConflicts();
}

// 6. Phone Keypad & Keyboard Actions
if (notesToggleBtn) {
  notesToggleBtn.addEventListener("click", () => {
    isNotesMode = !isNotesMode;
    notesToggleBtn.classList.toggle("active", isNotesMode);
    if (notesLabel) {
      notesLabel.textContent = isNotesMode ? "Notes: ON" : "Notes: OFF";
    }
    if (statusMsg) {
      statusMsg.textContent = isNotesMode 
        ? "Pencil Mode ON: Tapping digits toggles candidate notes." 
        : "Pencil Mode OFF: Tapping digits places cell numbers.";
    }
  });
}

if (phoneKeypad) {
  phoneKeypad.querySelectorAll(".num-btn").forEach(btn => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => {
      if (isTimerPaused) return;
      const num = parseInt(btn.dataset.key, 10);
      handleDigitInput(num);
    });
  });
}

if (eraseBtn) {
  eraseBtn.addEventListener("mousedown", (e) => e.preventDefault());
  eraseBtn.addEventListener("click", () => {
    if (selectedCellIndex >= 0 && selectedCellIndex < 81) {
      clearCell(selectedCellIndex);
    }
  });
}

function handleDigitInput(digit) {
  if (isTimerPaused || !gridContainer) return;

  if (selectedCellIndex === -1 || selectedCellIndex >= 81) {
    const cells = gridContainer.querySelectorAll(".cell");
    for (let i = 0; i < 81; i++) {
      if (!cells[i].classList.contains("given") && !getCellValue(cells[i])) {
        selectCell(i);
        break;
      }
    }
  }

  if (selectedCellIndex === -1 || selectedCellIndex >= 81) return;
  const cell = gridContainer.children[selectedCellIndex];
  if (!cell || cell.classList.contains("given")) return;

  if (isNotesMode) {
    toggleCellNote(selectedCellIndex, digit);
  } else {
    setCellValue(cell, String(digit));
    cell.classList.remove("solved", "hint");
    cellNotes[selectedCellIndex].clear();
    selectCell(selectedCellIndex);
    checkRealTimeConflicts();
  }
}

function handleKeyNavigation(e) {
  if (isTimerPaused || selectedCellIndex < 0) return;
  const row = Math.floor(selectedCellIndex / 9);
  const col = selectedCellIndex % 9;
  let targetIndex = null;

  switch (e.key) {
    case "ArrowUp":    if (row > 0) targetIndex = selectedCellIndex - 9; break;
    case "ArrowDown":  if (row < 8) targetIndex = selectedCellIndex + 9; break;
    case "ArrowLeft":  if (col > 0) targetIndex = selectedCellIndex - 1; break;
    case "ArrowRight": if (col < 8) targetIndex = selectedCellIndex + 1; break;
    case "Backspace":
    case "Delete":
      clearCell(selectedCellIndex);
      e.preventDefault();
      return;
    case "n":
    case "N":
      if (notesToggleBtn) notesToggleBtn.click();
      e.preventDefault();
      return;
  }

  if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    handleDigitInput(parseInt(e.key, 10));
    return;
  }

  if (targetIndex !== null) {
    e.preventDefault();
    selectCell(targetIndex);
  }
}

// 7. Real-Time Conflict Detection
function getBoardString() {
  if (!gridContainer) return "0".repeat(81);
  const cells = gridContainer.querySelectorAll(".cell");
  let result = "";
  cells.forEach(cell => {
    const val = getCellValue(cell);
    result += (val ? val : "0");
  });
  return result;
}

function setBoardString(boardStr, markAsGiven = false) {
  if (!gridContainer) return;
  const cells = gridContainer.querySelectorAll(".cell");
  for (let i = 0; i < 81; i++) {
    const val = boardStr[i] || "0";
    cellNotes[i].clear();
    renderCellNotes(i);

    if (val !== "0") {
      setCellValue(cells[i], val, markAsGiven);
    } else {
      setCellValue(cells[i], "", false);
    }
  }
  checkRealTimeConflicts();
}

function getConflictIndices(boardStr) {
  const conflicts = new Set();
  for (let i = 0; i < 81; i++) {
    const val = boardStr[i];
    if (val === "0") continue;

    const row = Math.floor(i / 9);
    const col = i % 9;
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);

    for (let j = i + 1; j < 81; j++) {
      if (boardStr[j] === val) {
        const r2 = Math.floor(j / 9);
        const c2 = j % 9;
        const bRow2 = Math.floor(r2 / 3);
        const bCol2 = Math.floor(c2 / 3);

        if (row === r2 || col === c2 || (boxRow === bRow2 && boxCol === bCol2)) {
          conflicts.add(i);
          conflicts.add(j);
        }
      }
    }
  }
  return conflicts;
}

function isValidBoardState(boardStr) {
  return getConflictIndices(boardStr).size === 0;
}

function checkRealTimeConflicts() {
  if (!gridContainer) return;
  const currentBoard = getBoardString();
  const conflicts = getConflictIndices(currentBoard);
  const cells = gridContainer.querySelectorAll(".cell");

  cells.forEach(cell => cell.classList.remove("conflict"));

  if (conflicts.size > 0) {
    gridContainer.classList.add("error-state", "shake");
    setTimeout(() => gridContainer.classList.remove("shake"), 400);

    conflicts.forEach(idx => {
      if (cells[idx]) {
        cells[idx].classList.add("conflict");
      }
    });

    if (statusMsg) {
      statusMsg.textContent = "⚠️ Conflict: Duplicate numbers in row, column, or 3×3 box!";
      statusMsg.style.color = "#ef4444";
    }
  } else {
    gridContainer.classList.remove("error-state", "shake");
    if (statusMsg && statusMsg.textContent.startsWith("⚠️ Conflict")) {
      statusMsg.textContent = "";
    }

    // Only celebrate if solved COMPLETELY by the player (not by the AI Solve button)
	if (!isAutoSolved && !currentBoard.includes("0") && isValidBoardState(currentBoard)) {
	stopTimer();
	if (statusMsg) {
		statusMsg.textContent = `🎉 Congratulations! You solved the puzzle in ${timerText ? timerText.textContent : ""}!`;
		statusMsg.style.color = "#10b981";
	}
	}
  }
}

// 8. Game Controls (New Puzzle, Hint, Solve, Reset, Clear)

// Clear Button
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (!gridContainer) return;
    const cells = gridContainer.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
      setCellValue(cell, "");
      cellNotes[i].clear();
      renderCellNotes(i);
    });
    currentOriginalPuzzle = "0".repeat(81);
    selectedCellIndex = -1;
    gridContainer.classList.remove("error-state", "shake");
    cells.forEach(cell => cell.classList.remove("conflict"));
    if (statusMsg) {
      statusMsg.textContent = "Grid completely cleared.";
      statusMsg.style.color = "var(--text-muted)";
    }
    stopTimer();
    if (timerText) timerText.textContent = "00:00";
  });
}

// Reset Button
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    setBoardString(currentOriginalPuzzle, true);
    if (statusMsg) {
      statusMsg.textContent = "Puzzle reset to starting clues.";
      statusMsg.style.color = "var(--text-muted)";
    }
    if (selectedCellIndex >= 0) selectCell(selectedCellIndex);
  });
}

// Smart Hint Button
if (hintBtn) {
  hintBtn.addEventListener("click", () => {
    if (!sudokuModule) {
      if (statusMsg) statusMsg.textContent = "C++ Solver is still loading...";
      return;
    }
    if (isTimerPaused || !gridContainer) return;
    const currentBoard = getBoardString();

    if (!isValidBoardState(currentBoard)) {
      gridContainer.classList.add("error-state", "shake");
      if (statusMsg) {
        statusMsg.textContent = "Fix conflicting numbers before requesting a hint!";
        statusMsg.style.color = "#ef4444";
      }
      setTimeout(() => gridContainer.classList.remove("shake"), 400);
      return;
    }

    if (!currentBoard.includes("0")) {
      if (statusMsg) {
        statusMsg.textContent = "The board is already filled!";
        statusMsg.style.color = "#10b981";
      }
      return;
    }

    const solvedBoard = sudokuModule.solvePuzzle(currentBoard);
    if (!solvedBoard || solvedBoard.length !== 81) {
      if (statusMsg) {
        statusMsg.textContent = "No valid solution exists from this board state.";
        statusMsg.style.color = "#ef4444";
      }
      return;
    }

    let targetIndex = -1;
    if (selectedCellIndex >= 0 && selectedCellIndex < 81 && currentBoard[selectedCellIndex] === "0") {
      targetIndex = selectedCellIndex;
    } else {
      const emptyIndices = [];
      for (let i = 0; i < 81; i++) {
        if (currentBoard[i] === "0") emptyIndices.push(i);
      }
      targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    const targetCell = gridContainer.children[targetIndex];
    const correctDigit = solvedBoard[targetIndex];

    if (targetCell) {
      setCellValue(targetCell, correctDigit, false);
      targetCell.classList.add("hint");
      cellNotes[targetIndex].clear();
      selectCell(targetIndex);
      checkRealTimeConflicts();

      const row = Math.floor(targetIndex / 9) + 1;
      const col = (targetIndex % 9) + 1;
      if (statusMsg) {
        statusMsg.textContent = `💡 Hint: Placed ${correctDigit} at Row ${row}, Column ${col}.`;
        statusMsg.style.color = "#f59e0b";
      }
    }
  });
}

// Solve Button
if (solveBtn) {
  solveBtn.addEventListener("click", () => {
    if (!sudokuModule) {
      if (statusMsg) statusMsg.textContent = "C++ Solver is still loading...";
      return;
    }
    if (isTimerPaused || !gridContainer) return;
    const currentBoard = getBoardString();

    if (!isValidBoardState(currentBoard)) {
      gridContainer.classList.add("error-state", "shake");
      if (statusMsg) {
        statusMsg.textContent = "Invalid board: Fix conflicting numbers first!";
        statusMsg.style.color = "#ef4444";
      }
      setTimeout(() => gridContainer.classList.remove("shake"), 400);
      return;
    }

    const startTime = performance.now();
    const solution = sudokuModule.solvePuzzle(currentBoard);
    const timeTaken = (performance.now() - startTime).toFixed(2);

	if (solution && solution.length === 81) {
	isAutoSolved = true; // Marks that the engine solved it, not the player
	const cells = gridContainer.querySelectorAll(".cell");
	for (let i = 0; i < 81; i++) {
		if (!getCellValue(cells[i])) {
		setCellValue(cells[i], solution[i], false);
		cells[i].classList.add("solved");
		cellNotes[i].clear();
		}
	}
	stopTimer();
	if (statusMsg) {
		statusMsg.textContent = `⚡ Puzzle solved by C++ Engine in ${timeTaken} ms!`;
		statusMsg.style.color = "var(--btn-primary)";
	}
	if (selectedCellIndex >= 0) selectCell(selectedCellIndex);
	checkRealTimeConflicts();
	}
	else {
      gridContainer.classList.add("error-state", "shake");
      if (statusMsg) {
        statusMsg.textContent = "This puzzle is unsolvable!";
        statusMsg.style.color = "#ef4444";
      }
      setTimeout(() => gridContainer.classList.remove("shake"), 400);
    }
  });
}

// Modal Logic
if (openGenerateBtn && difficultyModal) {
  openGenerateBtn.addEventListener("click", () => difficultyModal.showModal());
}

if (cancelBtn && difficultyModal) {
  cancelBtn.addEventListener("click", () => difficultyModal.close());
}

if (proceedBtn && difficultyModal) {
  proceedBtn.addEventListener("click", () => {
    if (!sudokuModule) {
      if (statusMsg) statusMsg.textContent = "C++ Solver is still loading...";
      return;
    }
    const checkedRadio = document.querySelector('input[name="difficulty"]:checked');
    const difficulty = checkedRadio ? parseInt(checkedRadio.value, 10) : 1;
    const puzzleString = sudokuModule.generatePuzzle(difficulty);

    currentOriginalPuzzle = puzzleString;
    setBoardString(puzzleString, true);
    startTimer();

    const diffName = difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard";
    if (statusMsg) {
      statusMsg.textContent = `Generated new ${diffName} puzzle. Timer started!`;
      statusMsg.style.color = "var(--text-main)";
    }
    difficultyModal.close();

    if (gridContainer) {
      const cells = gridContainer.querySelectorAll(".cell");
      for (let i = 0; i < 81; i++) {
        if (!cells[i].classList.contains("given")) {
          selectCell(i);
          break;
        }
      }
    }
  });
}

// 9. Startup Initialization
createGrid();
startTimer();