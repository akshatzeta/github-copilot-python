// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudoku-top-10';
let puzzle = [];
let elapsedSeconds = 0;
let timerInterval = null;
let hasCompletedCurrentPuzzle = false;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  document.getElementById('timer').innerText = formatTime(elapsedSeconds);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
}

function startTimer() {
  resetTimer();
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function showMessage(text, color = '#d32f2f') {
  const message = document.getElementById('message');
  message.style.color = color;
  message.innerText = text;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function getLeaderboardEntries() {
  try {
    const rawEntries = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!rawEntries) {
      return [];
    }
    const parsedEntries = JSON.parse(rawEntries);
    if (!Array.isArray(parsedEntries)) {
      return [];
    }
    return parsedEntries
      .filter((entry) => (
        entry &&
        typeof entry === 'object' &&
        typeof entry.name === 'string' &&
        typeof entry.difficulty === 'string' &&
        Number.isFinite(entry.time)
      ))
      .map((entry) => ({
        name: entry.name.trim() || 'Anonymous',
        difficulty: entry.difficulty,
        time: Number(entry.time)
      }));
  } catch (error) {
    console.warn('Unable to load leaderboard.', error);
    return [];
  }
}

function saveLeaderboardEntries(entries) {
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Unable to save leaderboard.', error);
  }
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  const entries = getLeaderboardEntries();

  if (!entries.length) {
    leaderboardList.innerHTML = '<li class="leaderboard-empty">No scores yet.</li>';
    return;
  }

  const topEntries = entries
    .slice()
    .sort((left, right) => left.time - right.time || left.name.localeCompare(right.name))
    .slice(0, 10);

  leaderboardList.innerHTML = topEntries
    .map((entry, index) => (
      `<li class="leaderboard-item">` +
      `<span class="leaderboard-rank">#${index + 1}</span>` +
      `<span class="leaderboard-name">${escapeHtml(entry.name)}</span>` +
      `<span class="leaderboard-time">${formatTime(entry.time)}</span>` +
      `<span class="leaderboard-difficulty">${escapeHtml(entry.difficulty)}</span>` +
      `</li>`
    ))
    .join('');
}

function saveCompletionToLeaderboard() {
  const playerName = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (playerName === null) {
    return;
  }

  const sanitizedName = playerName.trim() || 'Anonymous';
  const entry = {
    name: sanitizedName,
    time: elapsedSeconds,
    difficulty: document.getElementById('difficulty').value
  };

  const leaderboard = getLeaderboardEntries();
  leaderboard.push(entry);
  leaderboard.sort((left, right) => left.time - right.time || left.name.localeCompare(right.name));
  saveLeaderboardEntries(leaderboard.slice(0, 10));
  renderLeaderboard();
}

async function readApiResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'The request could not be completed.');
  }
  return data;
}

function updateSelectedDifficulty(difficulty) {
  document.getElementById('selected-difficulty').innerText =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function readBoard() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const value = inputs[i * SIZE + j].value;
      board[i][j] = value ? parseInt(value, 10) : 0;
    }
  }
  return {board, inputs};
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const query = new URLSearchParams({difficulty});
  hasCompletedCurrentPuzzle = false;
  resetTimer();

  try {
    const response = await fetch(`/new?${query}`);
    const data = await readApiResponse(response);
    renderPuzzle(data.puzzle);
    updateSelectedDifficulty(data.difficulty);
    startTimer();
    showMessage('', '#388e3c');
  } catch (error) {
    showMessage(`Unable to start a new game: ${error.message}`);
  }
}

async function checkSolution() {
  const {board, inputs} = readBoard();
  try {
    const response = await fetch('/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board})
    });
    const data = await readApiResponse(response);
    const msg = document.getElementById('message');
    if (data.error) {
      showMessage(data.error);
      return;
    }
    const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
    for (let idx = 0; idx < inputs.length; idx++) {
      const inp = inputs[idx];
      if (inp.disabled) continue;
      inp.className = 'sudoku-cell';
      if (incorrect.has(idx)) {
        inp.className = 'sudoku-cell incorrect';
      }
    }
    if (incorrect.size === 0) {
      if (hasCompletedCurrentPuzzle) {
        showMessage(
          `Congratulations! You solved it in ${formatTime(elapsedSeconds)}!`,
          '#388e3c'
        );
        return;
      }
      hasCompletedCurrentPuzzle = true;
      stopTimer();
      showMessage(
        `Congratulations! You solved it in ${formatTime(elapsedSeconds)}!`,
        '#388e3c'
      );
      saveCompletionToLeaderboard();
    } else {
      showMessage('Some cells are incorrect.');
    }
  } catch (error) {
    showMessage(`Unable to check the puzzle: ${error.message}`);
  }
}

async function requestHint() {
  const {board, inputs} = readBoard();

  try {
    const response = await fetch('/hint', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board})
    });
    const data = await readApiResponse(response);
    const input = inputs[data.row * SIZE + data.col];
    if (!input || input.disabled || input.value) {
      showMessage('The hint could not be applied to an empty cell.');
      return;
    }
    input.value = data.value;
    input.className = 'sudoku-cell hinted';
    showMessage('A correct cell was filled in.', '#388e3c');
  } catch (error) {
    showMessage(`Unable to get a hint: ${error.message}`);
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('difficulty').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', requestHint);
  renderLeaderboard();
  // initialize
  newGame();
});