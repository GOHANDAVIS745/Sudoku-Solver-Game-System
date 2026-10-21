#include <emscripten/bind.h>
#include <string>
#include "../core/Board.h"
#include "../core/BacktrackingSolver.h"
#include "../core/PuzzleGenerator.h"

std::string exportBoard(const Board& board) {
    std::string result = "";
    for (int r = 0; r < 9; ++r) {
        for (int c = 0; c < 9; ++c) {
            result += std::to_string(board.getCell(r, c));
        }
    }
    return result;
}

std::string solvePuzzle(std::string boardString) {
    if (boardString.length() != 81) return "";
    Board board;
    board.loadFromString(boardString);
    BacktrackingSolver solver;
    if (solver.solve(board)) {
        return exportBoard(board);
    }
    return "";
}

// New function for JavaScript to call
std::string getGeneratedPuzzle(int difficulty) {
    Board generatedBoard = generateSudoku(difficulty);
    return exportBoard(generatedBoard);
}

EMSCRIPTEN_BINDINGS(sudoku_module) {
    emscripten::function("solvePuzzle", &solvePuzzle);
    emscripten::function("generatePuzzle", &getGeneratedPuzzle);
}