// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];

function showMessage(text, color = '#d32f2f') {
  const message = document.getElementById('message');
  message.style.color = color;
  message.innerText = text;
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

  try {
    const response = await fetch(`/new?${query}`);
    const data = await readApiResponse(response);
    renderPuzzle(data.puzzle);
    updateSelectedDifficulty(data.difficulty);
    showMessage('', '#388e3c');
  } catch (error) {
    showMessage(`Unable to start a new game: ${error.message}`);
  }
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
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
      showMessage('Congratulations! You solved it!', '#388e3c');
    } else {
      showMessage('Some cells are incorrect.');
    }
  } catch (error) {
    showMessage(`Unable to check the puzzle: ${error.message}`);
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('difficulty').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  // initialize
  newGame();
});