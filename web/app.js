const gridContainer = document.getElementById("sudoku-grid");
const statusMsg = document.getElementById("status-message");

// Helper: 81-character sample puzzle (0 denotes empty cell)
const SAMPLE_PUZZLE = 
  "530070000" +
  "600195000" +
  "098000060" +
  "800060003" +
  "400803001" +
  "700020006" +
  "060000280" +
  "000419005" +
  "000080079";

// 1. Build the 9x9 grid in the DOM
function createGrid() {
  gridContainer.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.classList.add("cell");
    input.dataset.index = i;

    // Handle user input: digits 1-9 only
    input.addEventListener("input", handleInput);
    
    // Handle keyboard arrow navigation & deletion
    input.addEventListener("keydown", handleKeyNavigation);

    gridContainer.appendChild(input);
  }
}

// 2. Validate input: allow only digits 1 to 9
function handleInput(e) {
  const value = e.target.value;
  if (!/^[1-9]$/.test(value)) {
    e.target.value = "";
  } else {
    e.target.classList.remove("solved");
    e.target.classList.remove("given");
  }
}

// 3. Arrow key navigation between cells
function handleKeyNavigation(e) {
  const currentIndex = parseInt(e.target.dataset.index, 10);
  const row = Math.floor(currentIndex / 9);
  const col = currentIndex % 9;

  let targetIndex = null;

  switch (e.key) {
    case "ArrowUp":
      if (row > 0) targetIndex = currentIndex - 9;
      break;
    case "ArrowDown":
      if (row < 8) targetIndex = currentIndex + 9;
      break;
    case "ArrowLeft":
      if (col > 0) targetIndex = currentIndex - 1;
      break;
    case "ArrowRight":
      if (col < 8) targetIndex = currentIndex + 1;
      break;
    case "Backspace":
      e.target.value = "";
      break;
  }

  if (targetIndex !== null) {
    e.preventDefault();
    const targetCell = gridContainer.children[targetIndex];
    if (targetCell) targetCell.focus();
  }
}

// 4. Serialization: Convert grid inputs to an 81-character string
function getBoardString() {
  const cells = gridContainer.querySelectorAll(".cell");
  let result = "";
  cells.forEach(cell => {
    result += cell.value ? cell.value : "0";
  });
  return result;
}

// 5. Deserialization: Populate the grid from an 81-character string
function setBoardString(boardStr, markAsGiven = false) {
  const cells = gridContainer.querySelectorAll(".cell");
  for (let i = 0; i < 81 && i < boardStr.length; i++) {
    const val = boardStr[i];
    if (val !== "0") {
      cells[i].value = val;
      if (markAsGiven) {
        cells[i].classList.add("given");
      } else {
        cells[i].classList.add("solved");
      }
    } else {
      cells[i].value = "";
      cells[i].className = "cell";
    }
  }
}

// Button Listeners
document.getElementById("clear-btn").addEventListener("click", () => {
  const cells = gridContainer.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.value = "";
    cell.className = "cell";
  });
  statusMsg.textContent = "Grid cleared.";
  statusMsg.style.color = "#64748b";
});

document.getElementById("sample-btn").addEventListener("click", () => {
  setBoardString(SAMPLE_PUZZLE, true);
  statusMsg.textContent = "Sample puzzle loaded.";
  statusMsg.style.color = "#64748b";
});

// Mock Solve button placeholder (until Phase 4 Bridge is connected)
document.getElementById("solve-btn").addEventListener("click", () => {
  const boardData = getBoardString();
  console.log("81-character board string ready for C++ solver:", boardData);
  statusMsg.textContent = "Solving logic will be hooked in Phase 4 (Bridge).";
  statusMsg.style.color = "#2563eb";
});

// Initialize on page load
createGrid();