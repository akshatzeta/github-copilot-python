from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty')
    clues_value = request.args.get('clues')
    if difficulty is not None and clues_value is not None:
        return jsonify({'error': 'provide either difficulty or clues, not both'}), 400

    try:
        if difficulty is not None:
            puzzle, solution = sudoku_logic.generate_puzzle(
                difficulty=difficulty
            )
            selected_difficulty = difficulty.strip().lower()
        elif clues_value is not None:
            puzzle, solution = sudoku_logic.generate_puzzle(int(clues_value))
            selected_difficulty = None
        else:
            puzzle, solution = sudoku_logic.generate_puzzle()
            selected_difficulty = None
    except (TypeError, ValueError) as error:
        return jsonify({'error': str(error)}), 400
    except RuntimeError:
        return jsonify({'error': 'Unable to generate a unique puzzle'}), 503

    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({
        'puzzle': puzzle,
        'difficulty': selected_difficulty,
    })

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})


@app.route('/hint', methods=['POST'])
def provide_hint():
    data = request.get_json(silent=True)
    puzzle = CURRENT.get('puzzle')
    solution = CURRENT.get('solution')
    if puzzle is None or solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    if not isinstance(data, dict) or not _is_valid_board(data.get('board')):
        return jsonify({'error': 'A valid 9x9 board is required'}), 400

    board = data['board']
    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] == sudoku_logic.EMPTY and board[row][col] == sudoku_logic.EMPTY:
                return jsonify({
                    'row': row,
                    'col': col,
                    'value': solution[row][col],
                })

    return jsonify({'error': 'No empty cells available for a hint'}), 400


def _is_valid_board(board):
    if not isinstance(board, list) or len(board) != sudoku_logic.SIZE:
        return False
    return all(
        isinstance(row, list)
        and len(row) == sudoku_logic.SIZE
        and all(isinstance(value, int) and 0 <= value <= sudoku_logic.SIZE for value in row)
        for row in board
    )

if __name__ == '__main__':
    app.run(debug=True)