import random

import sudoku_logic


def assert_valid_sudoku_board(board):
    expected_values = set(range(1, sudoku_logic.SIZE + 1))

    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(set(row) == expected_values for row in board)
    assert all(
        {board[row][column] for row in range(sudoku_logic.SIZE)} == expected_values
        for column in range(sudoku_logic.SIZE)
    )
    assert all(
        {
            board[row][column]
            for row in range(box_row, box_row + 3)
            for column in range(box_column, box_column + 3)
        }
        == expected_values
        for box_row in range(0, sudoku_logic.SIZE, 3)
        for box_column in range(0, sudoku_logic.SIZE, 3)
    )


def test_generate_puzzle_returns_default_number_of_clues_and_solution():
    random.seed(1234)

    puzzle, solution = sudoku_logic.generate_puzzle()

    assert len(puzzle) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert sum(value != sudoku_logic.EMPTY for row in puzzle for value in row) == 35
    assert all(
        puzzle[row][column] in (sudoku_logic.EMPTY, solution[row][column])
        for row in range(sudoku_logic.SIZE)
        for column in range(sudoku_logic.SIZE)
    )


def test_generate_puzzle_returns_a_valid_completed_solution():
    random.seed(5678)

    _, solution = sudoku_logic.generate_puzzle()

    assert_valid_sudoku_board(solution)


def test_generated_puzzle_has_exactly_one_solution():
    random.seed(2468)

    puzzle, solution = sudoku_logic.generate_puzzle(35)

    assert sudoku_logic.count_solutions(puzzle) == 1
    assert sudoku_logic.count_solutions(puzzle) == 1
    assert sudoku_logic.count_solutions(solution) == 1


def test_returned_solution_solves_generated_puzzle():
    random.seed(1357)

    puzzle, solution = sudoku_logic.generate_puzzle(40)

    assert all(
        puzzle[row][column] in (sudoku_logic.EMPTY, solution[row][column])
        for row in range(sudoku_logic.SIZE)
        for column in range(sudoku_logic.SIZE)
    )
    assert sudoku_logic.count_solutions(puzzle) == 1


def test_requested_clue_count_is_preserved_for_practical_targets():
    for seed, clues in ((1, 50), (2, 40), (3, 35)):
        random.seed(seed)

        puzzle, _ = sudoku_logic.generate_puzzle(clues)

        assert sum(
            value != sudoku_logic.EMPTY for row in puzzle for value in row
        ) == clues
        assert sudoku_logic.count_solutions(puzzle) == 1


def test_full_range_clue_settings_return_valid_unique_puzzles():
    for seed, clues in ((4, 81), (5, 60)):
        random.seed(seed)

        puzzle, solution = sudoku_logic.generate_puzzle(clues)

        assert_valid_sudoku_board(solution)
        assert sudoku_logic.count_solutions(puzzle) == 1