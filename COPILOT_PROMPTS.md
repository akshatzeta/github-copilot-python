# GitHub Copilot Prompt & Evidence Log

## Purpose

This document records the major GitHub Copilot prompts used while
transforming the legacy Sudoku application.

The project requirement is not to accept Copilot output blindly.
Suggestions were reviewed, tested, and modified or rejected when they
did not best satisfy correctness, readability, security, or
maintainability requirements.

The Udacity submission should use screenshots with **descriptive
filenames** as the primary visual evidence of the Copilot conversations.

------------------------------------------------------------------------

## 1. Project Instructions

### Prompt

Create an `instruction.md` file for this Sudoku refactoring project. The
instructions should guide Copilot toward modern, readable Python/Flask
code, modular architecture, type hints, validation/error
handling/security, pytest testing, organized accessible frontend code,
responsive design, and Sudoku features such as difficulty levels, unique
solutions, hints, checking, timer, leaderboard, and dark mode. Copilot
suggestions must be reviewed and tested rather than accepted blindly.

### Result

Copilot inspected the project and created `instruction.md`.

------------------------------------------------------------------------

## 2. Testing Framework --- RUBRIC SCREENSHOT

### Prompt

Create a baseline pytest testing framework for the existing Sudoku Flask
project. Add appropriate test files for the Flask application and Sudoku
logic, configure reusable fixtures where useful, update requirements
with pytest, and make sure the original behavior is covered before
making larger changes. Run the tests and report the result.

### Evidence

Initial baseline: **8 tests passed**.

Recommended screenshot filename:

`testing_framework_prompt.png`

------------------------------------------------------------------------

## 3. Unique Solution --- RUBRIC SCREENSHOT

### Prompt

Refactor Sudoku puzzle generation so every generated puzzle has exactly
one solution. Keep the implementation readable and maintainable. Add
tests proving uniqueness and preserving existing behavior. Avoid an
unbounded generation loop; use bounded retry behavior and fail clearly
if a valid puzzle cannot be produced. Run the focused and complete
pytest suites.

### Critical review during implementation

An edge case appeared where greedy cell removal could stall at a higher
clue count. The implementation was revised to use bounded retries and
raise a clear `RuntimeError` rather than risk an incorrect clue count or
an infinite loop.

### Evidence

Focused suite: **13 passed**.\
Complete suite after the change: **19 passed**.

Recommended screenshot filename:

`unique_solution_prompt.png`

------------------------------------------------------------------------

## 4. Difficulty Levels

### Prompt

Add Sudoku difficulty levels while preserving backward compatibility.
Support Easy, Medium, and Hard with approximately 40, 32, and 24 clues
respectively. Preserve the existing `generate_puzzle()` behavior and
support existing clue-based calls. Validate invalid difficulty values
and preserve the unique-solution requirement. Add tests and run the
complete suite.

### Result

Difficulty generation and tests were implemented and committed.

------------------------------------------------------------------------

## 5. Flask Difficulty API

### Prompt

Add difficulty support to the Flask `/new` route. Support
`/new?difficulty=easy|medium|hard`, return the puzzle and canonical
difficulty, and keep the solution server-side. Preserve legacy `/new`
and clue-based behavior where appropriate. Return clear 400 responses
for invalid, malformed, or conflicting parameters and a 503 response for
puzzle-generation failures. Add route tests and run the complete test
suite.

### Result

The route implementation passed the expanded test suite.

------------------------------------------------------------------------

## 6. Frontend Difficulty Selector

### Prompt

Add an accessible native difficulty selector with Easy, Medium, and Hard
options. Changing the selector should immediately start a puzzle at the
selected difficulty, and New Game should respect the current selection.
Fetch `/new?difficulty=...`, show the active difficulty, handle errors
clearly, and keep the implementation readable. Run the existing pytest
suite and JavaScript syntax check.

### Validation

Pytest: **27 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 7. Timer

### Prompt

Add a game timer to the Sudoku frontend. The timer should start when a
new puzzle is loaded, reset whenever a new game or difficulty change
starts a puzzle, display elapsed time in MM:SS format, and stop when the
puzzle is correctly solved. Keep the implementation simple and readable.
Add an accessible timer element to the HTML and appropriate styling. Do
not change the Sudoku generation or Flask backend. Update the existing
frontend tests if appropriate, and run the existing pytest and
JavaScript syntax checks.

### Validation

Pytest: **27 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 8. Secure Hint

### Prompt

Add a Hint feature to the Sudoku game. Add a Hint button next to the
existing New Game and Check Solution buttons. When clicked, it should
select one currently empty cell and fill it with the correct value from
the server-provided solution. It must never overwrite a pre-filled
puzzle cell or an existing user entry. Keep the solution secure and do
not expose the full solution to the browser. Add appropriate Flask
endpoint support and frontend JavaScript/CSS changes, plus tests for the
hint behavior and invalid requests. Keep the implementation simple and
readable. Run the full pytest suite and JavaScript syntax check.

### Security review

The endpoint returns only one `{row, col, value}` object. The complete
solution remains server-side.

### Validation

Focused route suite: **21 passed**.\
Complete suite: **34 passed**.\
JavaScript syntax check: passed.

------------------------------------------------------------------------

## 9. Top 10 Leaderboard / localStorage --- RUBRIC SCREENSHOT

### Prompt

Add a local Top 10 leaderboard to the Sudoku frontend using browser
localStorage only.

Requirements:

-   Add a leaderboard section to `index.html`.
-   After a puzzle is successfully solved, prompt for the player's name.
-   Save player name, completion time in seconds, difficulty, and hints
    used to localStorage.
-   Use a clear localStorage key such as `sudokuLeaderboard`.
-   Sort scores by fastest completion time first.
-   Keep only the best 10 scores.
-   Display the leaderboard on the page.
-   Handle missing, invalid, or corrupted localStorage data safely.
-   Make the leaderboard persist after refreshing the page.
-   Do not add a database or backend storage.
-   Keep the existing difficulty selector, timer, hint, and
    check-solution behavior intact.
-   Add appropriate tests where practical.
-   Run the full pytest suite, JavaScript syntax check, and
    `git diff --check`.

### Evidence

Recommended screenshot filename:

`leaderboard_localstorage_prompt.png`

------------------------------------------------------------------------

## 10. 3×3 Grid Alternating Colors --- RUBRIC SCREENSHOT

### Prompt

Style the Sudoku board so the nine 3×3 squares alternate between two
clearly distinguishable background colors, following the project design
reference. The alternating colors must remain stable when cells are
edited, highlighted as invalid/conflicting, filled by a hint, or
switched between light and dark mode. Preserve the existing 9×9 layout
and ensure there are no visible layout shifts. Keep cell dimensions and
borders stable. Run the application and verify the board visually.

### Evidence

Recommended screenshot filename:

`grid_3x3_colors_prompt.png`

------------------------------------------------------------------------

## 11. Immediate Invalid-Move Feedback --- REQUIRED FIX

### Prompt

Improve Sudoku input validation so invalid moves trigger immediate
visual feedback as soon as the user enters a value, without waiting for
the Check Solution button. Highlight the invalid entry and the relevant
conflicting cells when a value duplicates a number in its row, column,
or 3×3 square. Preserve prefilled and hinted-cell behavior. Ensure the
feedback works in both light and dark modes without changing cell
dimensions or causing layout shifts. Add or update tests where practical
and run the full test and JavaScript syntax checks.

### Result

Invalid entries and conflicting cells receive immediate visual feedback.

------------------------------------------------------------------------

## 12. Dark Mode

### Prompt

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

------------------------------------------------------------------------

## 13. Responsive and Accessibility Polish

### Prompt

Focus on final frontend polish without adding new game features. Improve
the Sudoku UI for responsive design and accessibility.

Requirements:

-   Make the game usable on desktop, tablet, and mobile screen sizes.
-   Ensure the 9×9 Sudoku grid fits smaller screens without horizontal
    overflow.
-   Keep the 3×3 sub-grid borders visually clear.
-   Ensure buttons, difficulty selector, timer, hints, messages, dark
    mode, and leaderboard remain readable in both themes.
-   Ensure controls are keyboard accessible and have appropriate
    labels/ARIA attributes where needed.
-   Ensure sufficient visual contrast in light and dark modes.
-   Preserve all existing functionality.
-   Keep the implementation simple and maintainable.
-   Run the full pytest suite, `node --check starter/static/main.js`,
    and `git diff --check`.
-   Do not change Sudoku generation logic unless absolutely necessary.

------------------------------------------------------------------------

# Critical Copilot Evaluation Evidence --- REQUIRED

The rubric requires evidence of **critical evaluation of a Copilot
suggestion**. This is different from simply asking Copilot to add
another feature.

### Example documented evaluation

During Sudoku generation, Copilot suggested a more complex optimization
approach involving additional state tracking/heuristics. I evaluated it
against the project's requirements for readability and maintainability.

I chose the simpler implementation because:

1.  The project is intended as a refactoring/learning exercise.
2.  The simpler algorithm was easier to understand and test.
3.  The performance was sufficient for the required 9×9 puzzle size.
4.  Introducing unnecessary optimization would increase complexity and
    maintenance cost.

The implementation was then tested and adjusted when a bounded-removal
edge case was discovered.

### Required screenshot

Capture the Copilot conversation showing:

-   The original Copilot suggestion.
-   My evaluation/reasoning.
-   The rejection or modification of the suggestion.
-   The resulting implementation or explanation.

Recommended filename:

`copilot_suggestion_evaluation.png`

This screenshot is important because the rubric explicitly requires
evidence that a Copilot suggestion was **rejected or modified after
review**, not merely that another prompt was issued.

------------------------------------------------------------------------

# Recommended Screenshot Naming

Use descriptive names rather than generic names such as `image.png`,
`screenshot1.png`, or `test.png`.

Recommended minimum set:

``` text
Screenshots/
├── instruction_file.png
├── testing_framework_prompt.png
├── unique_solution_prompt.png
├── leaderboard_localstorage_prompt.png
├── grid_3x3_colors_prompt.png
├── copilot_suggestion_evaluation.png
├── difficulty_selector.png
├── timer.png
├── hint_feature.png
├── dark_mode.png
├── invalid_move_feedback.png
└── final_application.png
```

The four milestone screenshots explicitly called out by the rubric are:

1.  `testing_framework_prompt.png`
2.  `unique_solution_prompt.png`
3.  `leaderboard_localstorage_prompt.png`
4.  `grid_3x3_colors_prompt.png`

The critical-evaluation screenshot is additionally required:

5.  `copilot_suggestion_evaluation.png`

------------------------------------------------------------------------

# Final Validation Checklist

Before resubmitting:

-   [ ] `instruction.md` exists and is accessible to Copilot.
-   [ ] Required screenshots are present in `Screenshots/`.
-   [ ] Screenshot filenames are descriptive.
-   [ ] Testing framework prompt/response is documented.
-   [ ] Unique-solution prompt/response is documented.
-   [ ] Leaderboard/localStorage prompt/response is documented.
-   [ ] 3×3 alternating-color prompt/response is documented.
-   [ ] At least one Copilot suggestion was critically evaluated and
    rejected or modified.
-   [ ] Evidence of that evaluation is a screenshot or explanatory code
    comment.
-   [ ] 3×3 squares alternate in color without layout shifts.
-   [ ] Invalid moves trigger immediate visual feedback.
-   [ ] Hint fills and locks a valid cell.
-   [ ] Check highlights incorrect entries.
-   [ ] Completed games update the persistent Top 10 list.
-   [ ] Timer works.
-   [ ] Dark/light mode works.
-   [ ] Responsive layout works.
-   [ ] Full pytest suite passes.
-   [ ] `node --check starter/static/main.js` passes.
-   [ ] `git diff --check` passes.
-   [ ] All final changes are committed and pushed to GitHub.
