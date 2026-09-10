# Sudoku Game --- GitHub Copilot Refactoring Project

A Flask-based Sudoku game enhanced and refactored with GitHub Copilot.
The project focuses on readable Python, automated testing, secure
server-side Sudoku solutions, difficulty levels, and a responsive
accessible frontend.

## Features

-   9×9 Sudoku puzzle generation using a backtracking solver.
-   Puzzles are generated with a unique solution.
-   Three difficulty levels:
    -   Easy --- 40 clues
    -   Medium --- 32 clues
    -   Hard --- 24 clues
-   Flask API for starting a new puzzle by difficulty.
-   Client-side difficulty selector.
-   Game timer displayed in `MM:SS` format.
-   Hint functionality that reveals one correct empty cell.
-   Server-side solution protection: the complete solution is never
    returned to the browser.
-   Check Solution functionality with user feedback.
-   Top-10 leaderboard using browser `localStorage`.
-   Persistent leaderboard across page refreshes.
-   Light/Dark mode with persisted theme preference.
-   Responsive layout for smaller screens.
-   Accessibility improvements including semantic controls and
    accessible labels.
-   Automated pytest coverage for backend and Sudoku logic.
-   JavaScript syntax validation.

## Project Structure

``` text
github-copilot-python/
├── starter/
│   ├── app.py
│   ├── sudoku_logic.py
│   ├── requirements.txt
│   ├── static/
│   │   ├── main.js
│   │   └── styles.css
│   └── templates/
│       └── index.html
├── tests/
│   ├── conftest.py
│   ├── test_app.py
│   └── test_sudoku_logic.py
├── Screenshots/
├── instruction.md
├── README.md
└── COPILOT_PROMPTS.md
```

## Running the Application Locally

The project uses a Python virtual environment located under
`starter/.venv`.

From the repository root:

``` bash
./starter/.venv/bin/python -m pip install -r starter/requirements.txt
./starter/.venv/bin/python starter/app.py
```

Open:

``` text
http://127.0.0.1:5000
```

## Running Tests

From the repository root:

``` bash
./starter/.venv/bin/python -m pytest
```

The completed project currently passes the full automated test suite.

JavaScript syntax can be checked with:

``` bash
node --check starter/static/main.js
```

And whitespace/error checks can be performed with:

``` bash
git diff --check
```

## Sudoku Generation

The Sudoku generator first creates a complete valid board and then
removes values while preserving uniqueness. The solver/counting logic
stops after finding two solutions, which is sufficient to determine
whether a puzzle has more than one solution.

Puzzle generation uses bounded retry behavior so an unsuccessful removal
attempt cannot loop indefinitely.

## Difficulty Levels

The frontend requests a difficulty from the Flask application:

``` text
/new?difficulty=easy
/new?difficulty=medium
/new?difficulty=hard
```

The API returns the puzzle and canonical difficulty. The complete
solution remains stored server-side.

Legacy puzzle-generation parameters remain supported for compatibility
with the original application.

## Hint Security

The Hint endpoint accepts the current board and returns only one
coordinate/value pair.

Example response:

``` json
{
  "row": 0,
  "col": 3,
  "value": 7
}
```

The full Sudoku solution is never included in the Hint response. The
server also prevents hints from overwriting original puzzle cells or
cells already filled by the player.

## Timer

The timer is maintained entirely in the browser.

-   Starts after a puzzle successfully loads.
-   Resets when a new puzzle is started.
-   Resets when the difficulty changes.
-   Stops when the puzzle is correctly completed.
-   Displays elapsed time in `MM:SS`.

## Leaderboard

Completed games can be recorded with:

-   Player name
-   Completion time
-   Difficulty

Scores are stored in browser `localStorage`, sorted by fastest
completion time, and limited to the best ten entries. Corrupted or
missing stored data is handled safely.

## Dark Mode

The application supports Light Mode and Dark Mode. The selected theme is
stored in `localStorage` and restored when the application is loaded
again.

## Testing Strategy

Tests cover the main backend and Sudoku behaviors, including:

-   Flask routes
-   Difficulty validation
-   Puzzle generation
-   Unique-solution behavior
-   Hint validation and security
-   Invalid requests
-   Error handling
-   Frontend integration expectations where practical

The project also uses JavaScript syntax checking in addition to pytest.

## GitHub Copilot Usage

GitHub Copilot was used as an implementation assistant throughout the
refactoring process. Work was performed incrementally:

1.  Establish project instructions and coding standards.
2.  Create a baseline pytest framework.
3.  Improve Sudoku generation to guarantee unique solutions.
4.  Add difficulty levels.
5.  Add Flask difficulty support.
6.  Add the frontend difficulty selector.
7.  Add the game timer.
8.  Add the secure Hint feature.
9.  Add the Top-10 `localStorage` leaderboard.
10. Add Dark Mode.
11. Improve responsive design and accessibility.
12. Run tests and review Copilot-generated changes before committing.

Copilot suggestions were reviewed rather than accepted blindly. For
example, a more complex Sudoku optimization approach was considered, but
the simpler readable implementation was preferred where it better
matched the project's maintainability requirements.

See [`COPILOT_PROMPTS.md`](COPILOT_PROMPTS.md) for the prompt/evidence
log.

## Submission Evidence

The `Screenshots/` directory should contain the required screenshots
demonstrating:

-   Initial test framework and passing tests
-   Copilot instructions and development prompts
-   Unique-solution implementation
-   Difficulty implementation
-   Timer
-   Hint
-   Top-10 leaderboard
-   Sudoku grid styling
-   Dark Mode
-   Responsive/accessibility improvements
-   Relevant final application states

## Author

GitHub repository:

`https://github.com/akshatzeta/github-copilot-python`
