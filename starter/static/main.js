// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudoku-top-10';
const THEME_STORAGE_KEY = 'sudoku-theme';
let puzzle = [];
let elapsedSeconds = 0;
let timerInterval = null;
let hasCompletedCurrentPuzzle = false;
let hintsUsed = 0;

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
        time: Number(entry.time),
        hintsUsed: Number.isInteger(entry.hintsUsed) && entry.hintsUsed >= 0
          ? entry.hintsUsed
          : 0
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
      `<span class="leaderboard-hints">Hints Used: ${entry.hintsUsed}</span>` +
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
    difficulty: document.getElementById('difficulty').value,
    hintsUsed
  };

  const leaderboard = getLeaderboardEntries();
  leaderboard.push(entry);
  leaderboard.sort((left, right) => left.time - right.time || left.name.localeCompare(right.name));
  saveLeaderboardEntries(leaderboard.slice(0, 10));
  renderLeaderboard();
}

function setTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.dataset.theme = normalizedTheme;

  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = normalizedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    toggleButton.setAttribute('aria-pressed', String(normalizedTheme === 'dark'));
    toggleButton.setAttribute(
      'aria-label',
      normalizedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    console.warn('Unable to save theme preference.', error);
  }
}

function readThemePreference() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.warn('Unable to read theme preference.', error);
    return 'light';
  }
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
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
      input.className = `sudoku-cell ${(i + Math.floor(i / 3)) % 2 === 0 ? 'block-even' : 'block-odd'}`;
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        updateInvalidMoveFeedback();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getCellKey(row, col) {
  return `${row},${col}`;
}

function updateInvalidMoveFeedback() {
  const inputs = [...document.querySelectorAll('#sudoku-board .sudoku-cell')];
  inputs.forEach((input) => {
    input.classList.remove('invalid', 'conflict');
  });

  const boardValues = [];
  for (let row = 0; row < SIZE; row++) {
    boardValues[row] = [];
    for (let col = 0; col < SIZE; col++) {
      const input = inputs[row * SIZE + col];
      const rawValue = input.value.trim();
      boardValues[row][col] = rawValue ? parseInt(rawValue, 10) : 0;
    }
  }

  const conflictingCells = new Set();
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = boardValues[row][col];
      if (value === 0) {
        continue;
      }

      for (let otherCol = col + 1; otherCol < SIZE; otherCol++) {
        if (boardValues[row][otherCol] === value) {
          conflictingCells.add(getCellKey(row, col));
          conflictingCells.add(getCellKey(row, otherCol));
        }
      }

      for (let otherRow = row + 1; otherRow < SIZE; otherRow++) {
        if (boardValues[otherRow][col] === value) {
          conflictingCells.add(getCellKey(row, col));
          conflictingCells.add(getCellKey(otherRow, col));
        }
      }

      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let boxRow = startRow; boxRow < startRow + 3; boxRow++) {
        for (let boxCol = startCol; boxCol < startCol + 3; boxCol++) {
          if ((boxRow === row && boxCol === col) || boardValues[boxRow][boxCol] !== value) {
            continue;
          }
          conflictingCells.add(getCellKey(row, col));
          conflictingCells.add(getCellKey(boxRow, boxCol));
        }
      }
    }
  }

  conflictingCells.forEach((cellKey) => {
    const [row, col] = cellKey.split(',').map(Number);
    const input = inputs[row * SIZE + col];
    if (!input || input.disabled) {
      return;
    }
    input.classList.add('conflict');
  });

  inputs.forEach((input) => {
    if (input.value && !input.disabled && input.classList.contains('conflict')) {
      input.classList.add('invalid');
    }
  });
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
      inp.classList.remove('prefilled', 'hinted', 'invalid', 'conflict', 'incorrect');
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
  updateInvalidMoveFeedback();
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const query = new URLSearchParams({difficulty});
  hasCompletedCurrentPuzzle = false;
  hintsUsed = 0;
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
    hintsUsed += 1;
    input.classList.remove('invalid', 'conflict', 'incorrect');
    input.className = `${input.className} hinted`;
    showMessage('A correct cell was filled in.', '#388e3c');
    updateInvalidMoveFeedback();
  } catch (error) {
    showMessage(`Unable to get a hint: ${error.message}`);
  }
}

// Wire buttons
window.addEventListener('load', () => {
  const themeToggleButton = document.getElementById('theme-toggle');
  setTheme(readThemePreference());
  themeToggleButton.addEventListener('click', toggleTheme);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('difficulty').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', requestHint);
  renderLeaderboard();
  // initialize
  newGame();
});