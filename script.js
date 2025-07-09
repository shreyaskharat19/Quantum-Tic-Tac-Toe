// Initial game state setup
let board = Array(9).fill().map(() => []); // 3x3 board where each cell can have multiple quantum moves
let playerNames = { X: "Player X", O: "Player O" }; // Default player names
let moveCounter = 1; // Used to label each move (like X1, O2...)
let player = "X"; // X always starts first
let firstClick = null; // Stores the first cell clicked in a quantum move
let scoreX = 0, scoreO = 0, scoreDraw = 0; // Score tracking
let round = 1; // Tracks game rounds

// Toggle background music on/off
function toggleMusic() {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("muteBtn");
  if (audio.paused) {
    audio.play();
    btn.textContent = "🔊 Music";
  } else {
    audio.pause();
    btn.textContent = "🔇 Music";
  }
}

// Create the game board (9 clickable cells)
function createBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = ""; // Clear previous board (if any)
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${i}`;
    cell.addEventListener("click", () => handleClick(i)); // Add click event
    boardDiv.appendChild(cell); // Add to DOM
  }
}

// Handles each click on a cell
function handleClick(index) {
  if (firstClick === null) {
    firstClick = index; // Store first cell
    return;
  }

  if (index === firstClick) {
    firstClick = null; // Prevent same-cell double click
    return;
  }

  const moveId = `${player}${moveCounter}`; // e.g. X1, O2, etc.
  board[firstClick].push({ player, moveId }); // Add half-move
  board[index].push({ player, moveId }); // Add other half-move

  updateUI(); // Refresh board visuals

  // 30% chance to collapse move immediately
  if (Math.random() < 0.3) {
    collapse(moveId, firstClick, index);
  }

  moveCounter++; // Increment move number
  player = player === "X" ? "O" : "X"; // Switch player

  // Update turn indicator text
  document.getElementById("turnIndicator").textContent = `🔄 Turn: ${getPlayerName(player)}`;

  firstClick = null; // Reset click tracking
}

// Update the board UI (moves + collapsed cell highlighting)
function updateUI() {
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById(`cell-${i}`);
    cell.innerHTML = ""; // Clear previous content

    // If cell has only 1 move and it's collapsed (e.g. 'X' not 'X1')
    if (board[i].length === 1 && board[i][0].moveId.length === 1) {
      cell.classList.add("collapsed"); // Highlight it
    } else {
      cell.classList.remove("collapsed"); // Remove highlight if not final
    }

    // Add each move to the cell
    board[i].forEach(move => {
      const span = document.createElement("div");
      span.classList.add("move");
      span.textContent = move.moveId;
      span.style.color = move.player === "X" ? "#00f" : "#f00"; // Blue for X, Red for O
      cell.appendChild(span);
    });
  }
}

// Collapse a quantum move into a classical one
function collapse(moveId, i1, i2) {
  const collapseTo = Math.random() < 0.5 ? i1 : i2; // Randomly pick which cell to collapse into

  // Remove moveId from all cells
  for (let i = 0; i < 9; i++) {
    board[i] = board[i].filter(m => m.moveId !== moveId);
  }

  // Keep only the collapsed move in the chosen cell
  board[collapseTo] = [{ player, moveId: player }];

  updateUI(); // Refresh UI

  // Check if player won after collapse
  if (checkWin()) {
    updateScore(player);
    triggerConfetti(); // Celebrate win
  } else if (isDraw()) {
    updateScore("Draw"); // No one wins
  }

  // Add highlight class to collapsed cell
  document.getElementById(`cell-${collapseTo}`).classList.add("collapsed");
}

// Check if current player has won
function checkWin() {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // Rows
    [0,3,6], [1,4,7], [2,5,8], // Columns
    [0,4,8], [2,4,6]           // Diagonals
  ];
  return lines.some(line => {
    const [a, b, c] = line;
    return [a, b, c].every(i =>
      board[i].length === 1 && board[i][0].moveId === player
    );
  });
}

// Check for a draw (all cells collapsed, no winner)
function isDraw() {
  return board.every(cell => cell.length === 1) && !checkWin();
}

// Restart the game board (scores stay)
function restartGame() {
  board = Array(9).fill().map(() => []); // Empty board
  player = "X"; // X starts again
  moveCounter = 1;
  firstClick = null;
  document.getElementById("winModal").classList.add("hidden"); // Hide win modal
  createBoard(); // Rebuild board
}

// Get player name (fallback if blank)
function getPlayerName(symbol) {
  const nameX = document.getElementById("playerXName").value.trim() || "Player X";
  const nameO = document.getElementById("playerOName").value.trim() || "Player O";
  return symbol === "X" ? nameX : nameO;
}

// Show win/draw modal
function showModal(message) {
  document.getElementById("winMessage").textContent = message;
  document.getElementById("winModal").classList.remove("hidden");
}

// Update scores and display result
function updateScore(result) {
  let resultText = "";
  if (result === "X") {
    scoreX++;
    document.getElementById("scoreX").textContent = scoreX;
    resultText = `✅ Round ${round}: ${getPlayerName("X")} wins`;
    showModal(`🎉 ${getPlayerName("X")} Wins!`);
  } else if (result === "O") {
    scoreO++;
    document.getElementById("scoreO").textContent = scoreO;
    resultText = `✅ Round ${round}: ${getPlayerName("O")} wins`;
    showModal(`🎉 ${getPlayerName("O")} Wins!`);
  } else if (result === "Draw") {
    scoreDraw++;
    document.getElementById("scoreDraw").textContent = scoreDraw;
    resultText = `🤝 Round ${round}: Draw`;
    showModal(`🤝 It's a Draw!`);
  }
  logHistory(resultText); // Save game result
  round++;
}

// Add entry to game history list
function logHistory(text) {
  const list = document.getElementById("historyList");
  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);
}

// Confetti animation on win
function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.4 }
  });
}

// Reset all scores and history
function resetScores() {
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  round = 1;
  document.getElementById("scoreX").textContent = scoreX;
  document.getElementById("scoreO").textContent = scoreO;
  document.getElementById("scoreDraw").textContent = scoreDraw;
  document.getElementById("historyList").innerHTML = ""; // Clear history
}

// Start game after names entered
function startGame() {
  const nameX = document.getElementById("playerXName").value.trim();
  const nameO = document.getElementById("playerOName").value.trim();

  if (!nameX || !nameO) {
    alert("Please enter both player names!");
    return;
  }

  playerNames.X = nameX;
  playerNames.O = nameO;

  document.getElementById("startScreen").style.display = "none"; // Hide name entry screen
  createBoard(); // Create board

  // Show current player's turn
  document.getElementById("turnIndicator").textContent = `🔄 Turn: ${getPlayerName(player)}`;
}

// === AI MODE ===
let aiEnabled = false;

function toggleAIMode() {
  aiEnabled = document.getElementById("aiMode").checked;
}

function aiMove() {
  let availablePairs = [];
  for (let i = 0; i < 9; i++) {
    for (let j = i + 1; j < 9; j++) {
      if (i !== j && board[i].length < 2 && board[j].length < 2) {
        availablePairs.push([i, j]);
      }
    }
  }
  if (availablePairs.length > 0) {
    const [i1, i2] = availablePairs[Math.floor(Math.random() * availablePairs.length)];
    firstClick = i1;
    handleClick(i2);
  }
}

// Modify handleClick (non-destructive override via wrapper)
const originalHandleClick = handleClick;
handleClick = function(index) {
  originalHandleClick(index);
  if (aiEnabled && player === "O") setTimeout(aiMove, 600);
};

// === WINNING LINE HIGHLIGHT ===
function highlightWinningLine(line) {
  line.forEach(i => document.getElementById(`cell-${i}`).classList.add("winning-cell"));
}

// Modify checkWin to return winning line
function checkWin() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if ([a, b, c].every(i => board[i].length === 1 && board[i][0].moveId === player)) {
      highlightWinningLine(line);
      return true;
    }
  }
  return false;
}

// === MANUAL COLLAPSE ===
function manualCollapse() {
  for (let i = 0; i < 9; i++) {
    board[i].forEach(move => {
      if (move.moveId.length > 1) {
        const cells = [];
        for (let j = 0; j < 9; j++) {
          if (board[j].some(m => m.moveId === move.moveId)) cells.push(j);
        }
        if (cells.length === 2) collapse(move.moveId, cells[0], cells[1]);
      }
    });
  }
}

// === THEME TOGGLE ===
function toggleTheme() {
  document.body.classList.toggle("light");
}

// === HOVER PREVIEW ===
const boardDiv = document.getElementById("board");
boardDiv.addEventListener("mouseover", (e) => {
  if (firstClick !== null && e.target.classList.contains("cell")) {
    e.target.style.outline = "2px dashed #00ffff";
  }
});
boardDiv.addEventListener("mouseout", (e) => {
  if (e.target.classList.contains("cell")) {
    e.target.style.outline = "none";
  }
});

// === LOCAL STORAGE ===
function saveToLocal() {
  localStorage.setItem("quantumScores", JSON.stringify({
    X: scoreX, O: scoreO, D: scoreDraw, round
  }));
}
function loadFromLocal() {
  const data = JSON.parse(localStorage.getItem("quantumScores"));
  if (data) {
    scoreX = data.X;
    scoreO = data.O;
    scoreDraw = data.D;
    round = data.round;
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
    document.getElementById("scoreDraw").textContent = scoreDraw;
  }
}
window.onload = () => {
  document.getElementById("startScreen").style.display = "flex";
  loadFromLocal();
  autoStartTimeout = setTimeout(() => {
    const x = document.getElementById("playerXName").value.trim();
    const o = document.getElementById("playerOName").value.trim();
    if (x && o) startGame();
  }, 5000);
};

// Modify updateScore to save
const originalUpdateScore = updateScore;
updateScore = function(result) {
  originalUpdateScore(result);
  saveToLocal();
};

function hideIntro() {
  document.getElementById("introScreen").style.display = "none";
  document.getElementById("gateModal").classList.remove("hidden");
}

function showQuiz() {
  document.getElementById("gateModal").classList.add("hidden");
  document.getElementById("quizModal").classList.remove("hidden");
  askRandomQuiz();
}

const quizQuestions = [
  {
    q: "What does a Hadamard gate do?",
    options: ["Creates superposition", "Flips a qubit", "Deletes entanglement", "Clones qubits"],
    a: "Creates superposition"
  },
  {
    q: "What is the main function of a CNOT gate?",
    options: ["Noise removal", "Entanglement", "Cloning", "Phase shift"],
    a: "Entanglement"
  },
  {
    q: "Which gate flips a qubit?",
    options: ["X", "Z", "T", "H"],
    a: "X"
  },
  {
    q: "Which gate is known for rotating phase?",
    options: ["Z", "X", "CNOT", "SWAP"],
    a: "Z"
  }
];

let currentAnswer = "";

function askRandomQuiz() {
  const quiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
  document.getElementById("quizQuestion").textContent = quiz.q;
  const optionsHtml = quiz.options.map(option =>
    `<label><input type="radio" name="quizOption" value="${option}"> ${option}</label><br>`
  ).join("");
  document.getElementById("quizOptions").innerHTML = optionsHtml;
  currentAnswer = quiz.a.toLowerCase();
  document.getElementById("quizFeedback").textContent = "";
}

function checkQuizAnswer() {
  const selected = document.querySelector('input[name="quizOption"]:checked');
  const feedback = document.getElementById("quizFeedback");
  if (!selected) {
    feedback.textContent = "❗ Please select an answer.";
    return;
  }
  if (selected.value.toLowerCase() === currentAnswer) {
    feedback.textContent = "✅ Correct!";
    setTimeout(() => {
      document.getElementById("quizModal").classList.add("hidden");
      document.getElementById("startScreen").classList.remove("hidden");
    }, 1000);
  } else {
    feedback.textContent = `❌ Incorrect! Hint: ${currentAnswer}`;
  }
}

function learnMore() {
  window.open("https://quantum.country/qcvc", "_blank");
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = (event) => {
    document.getElementById("quizAnswer").value = event.results[0][0].transcript;
  };
}
