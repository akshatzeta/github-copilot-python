# Project Instructions

These instructions guide future GitHub Copilot changes to this Sudoku application.

## Code Quality and Architecture

- Use modern, readable Python and Flask practices consistent with the existing project.
- Keep application logic modular, maintainable, and easy to test.
- Separate Sudoku and game logic from Flask routes and frontend concerns where practical.
- Prefer small, reusable functions with clear names and single responsibilities.
- Add type hints when they improve clarity, especially at module and function boundaries.
- Avoid unnecessary dependencies and use the standard library or existing project dependencies when they are sufficient.
- Preserve existing functionality during refactoring unless a requirement explicitly changes it.
- Write code that can be tested independently of the web browser and request lifecycle.

## Validation and Error Handling

- Validate all user input on the server; do not trust browser-side validation.
- Handle invalid input and unexpected states with clear, appropriate errors.
- Do not silently ignore errors. Log or surface actionable information as appropriate for the context.
- Keep security-sensitive checks, including puzzle and board validation, on the server side.
- Do not weaken or delete tests simply to make them pass.

## Testing

- Use `pytest` for automated tests.
- Add or update focused tests when changing behavior, routes, Sudoku rules, or data handling.
- Test edge cases such as malformed boards, invalid values, unsupported difficulty settings, and missing game state.
- When modifying existing behavior, explain the reason for the change in the code review or accompanying documentation.

## Frontend

- Keep frontend JavaScript organized, readable, and free of unnecessary duplication.
- Keep browser behavior consistent with server-side validation and error responses.
- Build a responsive and accessible UI, including semantic markup, keyboard usability, useful labels, and sufficient visual contrast.
- Preserve a clear separation between presentation, browser interaction, and server/game logic.

## Sudoku and Product Requirements

Future changes must preserve or properly implement the project requirements for:

- Easy, medium, and hard Sudoku difficulty levels.
- Valid puzzles with unique solutions.
- Hints with clear visual indication and accurate hint tracking.
- Checking the current board and identifying incorrect entries.
- A reliable solve timer.
- Top-10 leaderboard data stored in `localStorage`, including the user's name, time, hints used, and difficulty.
- Responsive behavior on desktop and mobile devices.
- Accessible, visually appealing light and dark modes.
- Clear completion feedback that includes the solve time and hints used.

## Copilot Workflow

- Before making large changes, inspect the existing implementation, related tests, and call sites, then explain the proposed approach.
- Treat AI-generated code as a suggestion that must be reviewed, understood, and tested rather than blindly accepted.
- Explain unfamiliar code, patterns, libraries, or technologies when asked.
- Keep changes focused and document important design or behavior changes.