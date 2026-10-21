#include "BacktrackingSolver.h"

bool BacktrackingSolver::solve(Board& board) {
    int row, col;

    // 1. Base case: If no empty cell remains, puzzle is solved
    if (!board.findEmptyCell(row, col)) {
        return true;
    }

    // 2. Try placing digits 1 through 9
    for (int num = 1; num <= 9; ++num) {
        if (board.isValidPlacement(row, col, num)) {
            // Tentatively place candidate
            board.setCell(row, col, num, false);

            // Recurse to solve the rest of the board
            if (solve(board)) {
                return true;
            }

            // Backtrack: Reset cell if path leads to dead end
            board.setCell(row, col, 0, false);
        }
    }

    return false; // Trigger backtracking to previous recursive call
}