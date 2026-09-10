# GitHub Copilot Prompt & Development Log

This document records the major prompts used during the GitHub
Copilot-assisted Sudoku refactoring project.

> Note: The project was developed iteratively. This log preserves the
> substantive prompts used for each milestone rather than attempting to
> reproduce every incidental Copilot message.

## 1. Project Instructions

**Prompt / requirement given to Copilot:**

Create an `instruction.md` file for this Sudoku refactoring project. The
instructions should guide Copilot toward modern, readable Python/Flask
code, modular architecture, type hints, validation/error
handling/security, pytest testing, organized accessible frontend code,
responsive design, and Sudoku features such as difficulty levels, unique
solutions, hints, checking, timer, leaderboard, and dark mode. Copilot
suggestions must be reviewed and tested rather than accepted blindly.

**Result:**

Copilot inspected the project and created `instruction.md`.

------------------------------------------------------------------------

## 2. Baseline Testing Framework

**Prompt:**

Create a baseline pytest testing framework for the existing Sudoku Flask
project. Add appropriate test files for the Flask application and Sudoku
logic, configure reusable fixtures where useful, update requirements
with pytest, and make sure the original behavior is covered before
making larger changes. Run the tests and report the result.

**Validation:**

Baseline suite: **8 tests passed**.

------------------------------------------------------------------------

## 3. Unique-Solution Sudoku Generation

**Prompt:**

Refactor Sudoku puzzle generation so every generated puzzle has exactly
one solution. Keep the implementation readable and maintainable. Add
tests proving uniqueness and preserving existing behavior. Avoid an
unbounded generation loop; use bounded retry behavior and fail clearly
if a valid puzzle cannot be produced. Run the focused and complete
pytest suites.

**Copilot review:**

The first implementation exposed an edge case where greedy removal could
stall at a higher clue count. Copilot revised the approach to use
bounded retries and raise a clear `RuntimeError` rather than risk an
incorrect clue count or infinite loop.

**Validation:**

Focused suite: **13 passed**.\
Complete suite after the change: **19 passed**.

------------------------------------------------------------------------

## 4. Difficulty Levels

**Prompt:**

Add Sudoku difficulty levels while preserving backward compatibility.
Support Easy, Medium, and Hard with approximately 40, 32, and 24 clues
respectively. Preserve the existing `generate_puzzle()` behavior and
support existing clue-based calls. Validate invalid difficulty values
and preserve the unique-solution requirement. Add tests and run the
complete suite.

**Validation:**

The difficulty implementation and tests were accepted and committed.

------------------------------------------------------------------------

## 5. Flask Difficulty API

**Prompt:**

Add difficulty support to the Flask `/new` route. Support
`/new?difficulty=easy|medium|hard`, return the puzzle and canonical
difficulty, and keep the solution server-side. Preserve legacy `/new`
and clue-based behavior where appropriate. Return clear 400 responses
for invalid, malformed, or conflicting parameters and a 503 response for
puzzle-generation failures. Add route tests and run the complete test
suite.

**Validation:**

Focused route tests passed and the complete suite reached **27 passed**.

------------------------------------------------------------------------

## 6. Frontend Difficulty Selector

**Prompt:**

Add an accessible native difficulty selector with Easy, Medium, and Hard
options. Changing the selector should immediately start a puzzle at the
selected difficulty, and New Game should respect the current selection.
Fetch `/new?difficulty=...`, show the active difficulty, handle errors
clearly, and keep the implementation readable. Run the existing pytest
suite and JavaScript syntax check.

**Validation:**

Pytest: **27 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 7. Game Timer

**Prompt:**

Add a game timer to the Sudoku frontend. The timer should start when a
new puzzle is loaded, reset whenever a new game or difficulty change
starts a puzzle, display elapsed time in MM:SS format, and stop when the
puzzle is correctly solved. Keep the implementation simple and readable.
Add an accessible timer element to the HTML and appropriate styling. Do
not change the Sudoku generation or Flask backend. Update the existing
frontend tests if appropriate, and run the existing pytest and
JavaScript syntax checks.

**Validation:**

Pytest: **27 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 8. Secure Hint Feature

**Prompt:**

Add a Hint feature to the Sudoku game. Add a Hint button next to the
existing New Game and Check Solution buttons. When clicked, it should
select one currently empty cell and fill it with the correct value from
the server-provided solution. It must never overwrite a pre-filled
puzzle cell or an existing user entry. Keep the solution secure and do
not expose the full solution to the browser. Add appropriate Flask
endpoint support and frontend JavaScript/CSS changes, plus tests for the
hint behavior and invalid requests. Keep the implementation simple and
readable. Run the full pytest suite and JavaScript syntax check.

**Copilot design:**

The implementation added `POST /hint`. The server accepts the current
board and returns only one coordinate/value pair. The full solution
remains server-side.

**Validation:**

Focused route suite: **21 tests passed**.\
Complete suite: **34 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 9. Top-10 Leaderboard

**Prompt:**

Add a local Top 10 leaderboard to the Sudoku frontend using browser
localStorage only.

Requirements: - Add a leaderboard section to `index.html`. - After a
puzzle is successfully solved, prompt the player for their name. - Save
the player's name, completion time in seconds, and difficulty to
localStorage. - Use a clear localStorage key such as
`sudokuLeaderboard`. - Sort scores by fastest completion time first. -
Keep only the best 10 scores. - Display the leaderboard on the page. -
Handle missing, invalid, or corrupted localStorage data safely. - Make
the leaderboard persist after refreshing the page. - Do not add a
database or backend storage. - Keep the existing difficulty selector,
timer, hint, and check-solution behavior intact. - Add appropriate tests
where practical. - Run the full pytest suite, JavaScript syntax check,
and `git diff --check`.

**Result:**

The leaderboard was implemented and pushed to GitHub. The local
application showed the `Top 10 Leaderboard` section successfully.

------------------------------------------------------------------------

## 10. Dark Mode

**Prompt:**

Add a Dark Mode toggle to the Sudoku frontend. Add an accessible
toggle/button near the existing controls. Use a CSS class or data
attribute on the page to switch between light and dark themes. Make sure
the Sudoku grid, cells, text, buttons, timer, difficulty selector,
messages, and Top 10 leaderboard remain readable in both themes. Persist
the user's theme preference using localStorage and restore it when the
page loads. Keep all existing Sudoku functionality unchanged. Add or
update tests where practical, run the full pytest suite,
`node --check starter/static/main.js`, and `git diff --check`. Do not
change the Sudoku generation or backend logic.

**Result:**

Dark Mode was implemented and the local application was verified
visually.

------------------------------------------------------------------------

## 11. Responsive and Accessibility Polish

**Prompt:**

Now focus on the final frontend polish. Do not add any new game
features. Improve the Sudoku UI for responsive design and accessibility.

Requirements: - Make the game usable on desktop, tablet, and mobile
screen sizes. - Ensure the 9x9 Sudoku grid fits smaller screens without
horizontal overflow. - Keep the 3x3 sub-grid borders visually clear. -
Ensure buttons, difficulty selector, timer, hints, messages, dark mode,
and leaderboard remain readable in both themes. - Ensure controls are
keyboard accessible and have appropriate labels/ARIA attributes where
needed. - Ensure sufficient visual contrast in light and dark modes. -
Preserve all existing functionality: difficulty, timer, hint, check
solution, leaderboard, and dark mode. - Keep the implementation simple
and maintainable. - Run the full pytest suite,
`node --check starter/static/main.js`, and `git diff --check`. - Do not
change Sudoku generation logic unless absolutely necessary.

**Result:**

The frontend was polished for responsive behavior and accessibility
while preserving the existing game functionality.

------------------------------------------------------------------------

# Copilot Review / Evaluation Evidence

Copilot was treated as an assistant rather than an authority.
Suggestions were reviewed against the project requirements, readability,
security, and testability.

One important example was Sudoku generation. A more optimized/complex
approach was considered, but the project favored a simpler
implementation that was easier to understand and maintain. During
testing, an edge case where puzzle removal could stall was identified
and corrected with bounded retries and explicit failure handling.

The Hint implementation was also reviewed specifically for security: the
complete solution must remain on the server, and the browser should
receive only the single hinted cell.

# Validation History

  Milestone                    Validation
  ---------------------------- -------------------------
  Baseline tests               8 passed
  Unique-solution generation   19 total passed
  Difficulty levels            Tests passed
  Flask difficulty routes      27 total passed
  Timer                        27 passed
  Hint                         34 passed
  JavaScript                   `node --check` passed
  Final changes                `git diff --check` used

# Final Submission Notes

Before submitting, verify:

1.  All required screenshots are in the expected `Screenshots/`
    directory.
2.  `instruction.md` is committed.
3.  `README.md` is committed.
4.  This prompt log is committed.
5.  The final pytest suite passes.
6.  JavaScript syntax check passes.
7.  `git status` is clean.
8.  All final commits are pushed to the GitHub fork.
