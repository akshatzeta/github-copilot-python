import copy
import random

SIZE = 9
EMPTY = 0
Board = list[list[int]]

def deep_copy(board: Board) -> Board:
    return copy.deepcopy(board)

def create_empty_board() -> Board:
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board: Board, row: int, col: int, num: int) -> bool:
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board: Board) -> bool:
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def _is_complete_valid_board(board: Board) -> bool:
    expected = set(range(1, SIZE + 1))

    rows_valid = all(set(row) == expected for row in board)
    columns_valid = all(
        {board[row][column] for row in range(SIZE)} == expected
        for column in range(SIZE)
    )
    boxes_valid = all(
        {
            board[row][column]
            for row in range(box_row, box_row + 3)
            for column in range(box_column, box_column + 3)
        }
        == expected
        for box_row in range(0, SIZE, 3)
        for box_column in range(0, SIZE, 3)
    )
    return rows_valid and columns_valid and boxes_valid


def count_solutions(board: Board, limit: int = 2) -> int:
    """Count puzzle solutions, stopping once ``limit`` is reached."""
    if limit < 1:
        raise ValueError("limit must be at least 1")

    working_board = deep_copy(board)
    solution_count = 0

    def search() -> None:
        nonlocal solution_count
        if solution_count >= limit:
            return

        for row in range(SIZE):
            for col in range(SIZE):
                if working_board[row][col] == EMPTY:
                    for candidate in range(1, SIZE + 1):
                        if is_safe(working_board, row, col, candidate):
                            working_board[row][col] = candidate
                            search()
                            working_board[row][col] = EMPTY
                            if solution_count >= limit:
                                return
                    return

        if _is_complete_valid_board(working_board):
            solution_count += 1

    search()
    return solution_count


def remove_cells(board: Board, clues: int) -> None:
    """Remove as many cells as possible while preserving a unique solution."""
    cells_to_remove = SIZE * SIZE - clues
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)

    removed = 0
    for row, col in positions:
        if removed >= cells_to_remove:
            break

        original_value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board) == 1:
            removed += 1
        else:
            board[row][col] = original_value


def generate_puzzle(clues: int = 35) -> tuple[Board, Board]:
    if not isinstance(clues, int):
        raise TypeError("clues must be an integer")
    if not 0 <= clues <= SIZE * SIZE:
        raise ValueError(f"clues must be between 0 and {SIZE * SIZE}")

    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
