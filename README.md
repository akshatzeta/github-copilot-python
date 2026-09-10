# Sudoku Game --- Refactoring Legacy Code with GitHub Copilot

## Project Overview

This project transforms a basic Flask Sudoku application into a
polished, user-friendly Sudoku game using GitHub Copilot as a
development assistant.

The final application includes difficulty levels, unique-solution puzzle
generation, immediate invalid-move feedback, hints, a timer, completion
feedback, a persistent Top 10 leaderboard, dark/light mode, responsive
layout, and accessibility improvements.

## Features

-   9×9 Sudoku board with clear 3×3 square grouping.
-   Alternating colors for the 3×3 squares with stable cell dimensions.
-   Sudoku puzzles with exactly one unique solution.
-   Easy, Medium, and Hard difficulty levels.
-   Prefilled cells are locked.
-   Immediate visual feedback for invalid/conflicting entries.
-   Check Solution functionality.
-   Hint button that fills and locks one valid empty cell.
-   Game timer with `MM:SS` display.
-   Completion message when the puzzle is solved.
-   Persistent Top 10 leaderboard using browser `localStorage`.
-   Leaderboard records player name, time, difficulty, and hints.
-   Light/Dark mode with persisted theme preference.
-   Responsive desktop/mobile layout.
-   Keyboard-accessible controls and appropriate accessible labels.
-   Automated pytest test suite.
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

## Running the Application

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

Also validate the frontend JavaScript:

``` bash
node --check starter/static/main.js
```

Check the final Git diff for whitespace errors:

``` bash
git diff --check
```

## Sudoku Generation and Uniqueness

The Sudoku generator creates a valid completed board and removes values
while preserving a unique solution.

The solution-counting logic stops after finding two solutions. Finding
two solutions is sufficient to establish that a puzzle is not unique.

Puzzle generation uses bounded retry behavior. If a requested puzzle
cannot be generated within the retry limit, the application fails
clearly rather than entering an infinite loop.

## Difficulty Levels

The application supports:

  Difficulty     Target clues
  ------------ --------------
  Easy                     40
  Medium                   32
  Hard                     24

The frontend requests the selected difficulty from the Flask
application. The complete solution remains server-side.

## Immediate Invalid-Move Feedback

When a player enters an invalid number, the frontend immediately
provides visual feedback rather than waiting for the Check Solution
button.

Conflicting cells are also visually indicated so that users can
understand which values violate Sudoku row, column, or 3×3-square rules.

This behavior is intentionally separate from the final Check Solution
action.

## Hint Security

The Hint feature uses a `POST /hint` endpoint.

The browser sends the current board, and the server returns only one
coordinate/value pair. The complete solution is never sent to the
browser.

The endpoint:

-   Requires an active game.
-   Validates the submitted 9×9 board.
-   Ignores original prefilled cells.
-   Does not overwrite existing user entries.
-   Returns one valid hint.
-   Reports a clear error when no usable empty cell remains.

## Timer

The timer:

-   Starts after a puzzle loads successfully.
-   Resets when a new game starts.
-   Resets when difficulty changes.
-   Stops when the puzzle is solved correctly.
-   Displays elapsed time as `MM:SS`.

## Top 10 Leaderboard

The leaderboard uses browser `localStorage`; no database is required.

A completed game records:

-   Player name
-   Completion time
-   Difficulty
-   Number of hints used

Scores are sorted by fastest time and limited to the best ten. The
leaderboard survives page refreshes and safely handles missing/corrupted
stored data.

## Dark Mode

The application supports Light Mode and Dark Mode.

The selected theme is stored in `localStorage` and restored on
subsequent page loads. Grid cells, controls, messages, timer, and
leaderboard remain readable in both themes.

## Responsive Design and Accessibility

The layout adapts between desktop and smaller screens without requiring
horizontal scrolling for the game board.

Controls are keyboard accessible and use appropriate semantic elements
and labels. Text and controls maintain readable contrast in both themes.

The Sudoku grid uses stable dimensions and borders so changing cell
states does not cause visible layout shifts.

## Testing

The project uses pytest for backend and Sudoku logic coverage.

Testing includes:

-   Flask route behavior.
-   Difficulty validation.
-   Sudoku generation.
-   Unique-solution behavior.
-   Hint validation and security.
-   Invalid requests and error handling.
-   Application integration expectations.

The frontend JavaScript is additionally checked with Node's syntax
checker.

## GitHub Copilot Usage

GitHub Copilot was used incrementally as a development assistant.

Major milestones:

1.  Create project-specific `instruction.md`.
2.  Establish baseline pytest testing.
3.  Implement unique-solution Sudoku generation.
4.  Add difficulty levels.
5.  Add Flask difficulty support.
6.  Add the frontend difficulty selector.
7.  Add the timer.
8.  Add the secure Hint feature.
9.  Add the Top 10 `localStorage` leaderboard.
10. Add Dark Mode.
11. Improve responsive design and accessibility.
12. Add/improve immediate invalid-move and conflicting-cell feedback.
13. Review, test, and validate the final implementation.

Copilot output was reviewed rather than accepted automatically. At least
one Copilot suggestion was deliberately evaluated and rejected/modified
because a simpler, more maintainable approach better matched the project
requirements. Evidence of this evaluation is included in the submission
screenshots and prompt log.

## Submission Evidence

The `Screenshots/` folder should contain descriptively named evidence
files, especially for the rubric-required milestones:

-   `testing_framework_prompt.png`
-   `unique_solution_prompt.png`
-   `leaderboard_localstorage_prompt.png`
-   `grid_3x3_colors_prompt.png`
-   `copilot_suggestion_evaluation.png`

Additional descriptive screenshots may document the timer, hint,
difficulty selector, dark mode, responsive design, and final
application.

## GitHub Repository

`https://github.com/akshatzeta/github-copilot-python`
