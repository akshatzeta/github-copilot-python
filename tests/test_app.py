def test_index_route_renders_game_page(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"Sudoku Game" in response.data


def test_new_game_route_returns_a_puzzle_with_default_clues(client, monkeypatch):
    import random

    random.seed(1234)

    response = client.get("/new")

    assert response.status_code == 200
    puzzle = response.get_json()["puzzle"]
    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert sum(value != 0 for row in puzzle for value in row) == 35


def test_new_game_route_honors_clues_parameter(client, monkeypatch):
    import random

    random.seed(4321)

    response = client.get("/new?clues=81")

    assert response.status_code == 200
    puzzle = response.get_json()["puzzle"]
    assert all(value != 0 for row in puzzle for value in row)


def test_check_route_reports_no_game_in_progress(client):
    response = client.post("/check", json={"board": [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json() == {"error": "No game in progress"}


def test_check_route_accepts_completed_puzzle(client, monkeypatch):
    import random

    random.seed(2468)
    puzzle_response = client.get("/new?clues=81")
    puzzle = puzzle_response.get_json()["puzzle"]

    response = client.post("/check", json={"board": puzzle})

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": []}


def test_check_route_reports_incorrect_cells(client, monkeypatch):
    import random

    random.seed(2468)
    puzzle_response = client.get("/new?clues=81")
    puzzle = puzzle_response.get_json()["puzzle"]
    puzzle[0][0] = (puzzle[0][0] % 9) + 1

    response = client.post("/check", json={"board": puzzle})

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": [[0, 0]]}