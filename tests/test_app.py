import random
from pathlib import Path

import pytest

import app as sudoku_app


FRONTEND_SCRIPT_PATH = Path(__file__).resolve().parents[1] / "starter" / "static" / "main.js"


def test_index_route_renders_game_page(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"Sudoku Game" in response.data
    assert b'id="difficulty"' in response.data
    assert b'value="easy"' in response.data
    assert b'value="medium"' in response.data
    assert b'value="hard"' in response.data
    assert b'id="timer"' in response.data
    assert b'00:00' in response.data
    assert b'id="hint"' in response.data
    assert b'Top 10 Leaderboard' in response.data
    assert b'id="leaderboard-list"' in response.data


def test_frontend_script_contains_local_storage_leaderboard_logic():
    script_contents = FRONTEND_SCRIPT_PATH.read_text()

    assert "sudoku-top-10" in script_contents
    assert "localStorage" in script_contents
    assert "window.prompt" in script_contents
    assert "renderLeaderboard" in script_contents
    assert "saveCompletionToLeaderboard" in script_contents


def test_new_game_route_returns_a_puzzle_with_default_clues(client):
    random.seed(1234)

    response = client.get("/new")

    assert response.status_code == 200
    puzzle = response.get_json()["puzzle"]
    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert sum(value != 0 for row in puzzle for value in row) == 35
    assert response.get_json()["difficulty"] is None


def test_new_game_route_honors_clues_parameter(client):
    random.seed(4321)

    response = client.get("/new?clues=81")

    assert response.status_code == 200
    puzzle = response.get_json()["puzzle"]
    assert all(value != 0 for row in puzzle for value in row)
    assert response.get_json()["difficulty"] is None


@pytest.mark.parametrize(
    ("difficulty", "expected_clues"),
    (("easy", 40), ("medium", 32), ("hard", 24)),
)
def test_new_game_route_generates_requested_difficulty(
    client, difficulty, expected_clues
):
    random.seed(expected_clues)

    response = client.get(f"/new?difficulty={difficulty}")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["difficulty"] == difficulty
    assert sum(
        value != 0 for row in payload["puzzle"] for value in row
    ) == expected_clues
    assert "solution" not in payload


@pytest.mark.parametrize("difficulty", ("unknown", "", "expert"))
def test_new_game_route_rejects_invalid_difficulty(client, difficulty):
    response = client.get(f"/new?difficulty={difficulty}")

    assert response.status_code == 400
    assert "difficulty must be one of" in response.get_json()["error"]


def test_new_game_route_rejects_malformed_clues(client):
    response = client.get("/new?clues=not-a-number")

    assert response.status_code == 400
    assert response.get_json() == {
        "error": "invalid literal for int() with base 10: 'not-a-number'"
    }


def test_new_game_route_rejects_conflicting_generation_parameters(client):
    response = client.get("/new?difficulty=easy&clues=40")

    assert response.status_code == 400
    assert response.get_json() == {
        "error": "provide either difficulty or clues, not both"
    }


def test_check_route_reports_no_game_in_progress(client):
    response = client.post("/check", json={"board": [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json() == {"error": "No game in progress"}


def test_check_route_accepts_completed_puzzle(client):
    random.seed(2468)
    puzzle_response = client.get("/new?clues=81")
    puzzle = puzzle_response.get_json()["puzzle"]

    response = client.post("/check", json={"board": puzzle})

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": []}


def test_check_route_reports_incorrect_cells(client):
    random.seed(2468)
    puzzle_response = client.get("/new?clues=81")
    puzzle = puzzle_response.get_json()["puzzle"]
    puzzle[0][0] = (puzzle[0][0] % 9) + 1

    response = client.post("/check", json={"board": puzzle})

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": [[0, 0]]}


def test_hint_route_returns_one_empty_cell_without_exposing_solution(client):
    random.seed(2468)
    puzzle_response = client.get("/new?clues=40")
    puzzle = puzzle_response.get_json()["puzzle"]
    empty_cell = next(
        (row, col)
        for row in range(9)
        for col in range(9)
        if puzzle[row][col] == 0
    )

    response = client.post("/hint", json={"board": puzzle})

    assert response.status_code == 200
    hint = response.get_json()
    assert (hint["row"], hint["col"]) == empty_cell
    assert hint["value"] == sudoku_app.CURRENT["solution"][hint["row"]][hint["col"]]
    assert "solution" not in hint


def test_hint_route_does_not_overwrite_existing_user_entry(client):
    random.seed(2468)
    puzzle_response = client.get("/new?clues=40")
    puzzle = puzzle_response.get_json()["puzzle"]
    existing_entry = next(
        (row, col)
        for row in range(9)
        for col in range(9)
        if puzzle[row][col] == 0
    )
    puzzle[existing_entry[0]][existing_entry[1]] = 1

    response = client.post("/hint", json={"board": puzzle})

    assert response.status_code == 200
    hint = response.get_json()
    assert (hint["row"], hint["col"]) != existing_entry


def test_hint_route_reports_when_no_empty_cells_are_available(client):
    random.seed(2468)
    puzzle_response = client.get("/new?clues=81")
    puzzle = puzzle_response.get_json()["puzzle"]

    response = client.post("/hint", json={"board": puzzle})

    assert response.status_code == 400
    assert response.get_json() == {"error": "No empty cells available for a hint"}


@pytest.mark.parametrize("board", (None, [], [[0] * 9 for _ in range(8)]))
def test_hint_route_rejects_malformed_board(client, board):
    client.get("/new?clues=81")

    response = client.post("/hint", json={"board": board})

    assert response.status_code == 400
    assert response.get_json() == {"error": "A valid 9x9 board is required"}


def test_hint_route_requires_an_active_game(client):
    response = client.post("/hint", json={"board": [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json() == {"error": "No game in progress"}