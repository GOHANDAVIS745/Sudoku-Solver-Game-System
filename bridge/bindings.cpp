#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <cstdlib>
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

// Solves the board and returns "index:value" for one empty square
std::string getSmartHint(std::string boardString, int preferredIndex) {
    if (boardString.length() != 81) return "";

    Board board;
    board.loadFromString(boardString);
    BacktrackingSolver solver;

    // Solve in the background
    if (!solver.solve(board)) {
        return ""; // Board is unsolvable from the current state
    }

    std::string solvedString = exportBoard(board);

    // 1. If player is currently focused on an empty cell, hint that specific square
    if (preferredIndex >= 0 && preferredIndex < 81 && boardString[preferredIndex] == '0') {
        return std::to_string(preferredIndex) + ":" + solvedString[preferredIndex];
    }

    // 2. Otherwise, collect all empty squares
    std::vector<int> emptyIndices;
    for (int i = 0; i < 81; ++i) {
        if (boardString[i] == '0') {
            emptyIndices.push_back(i);
        }
    }

    if (emptyIndices.empty()) return ""; // Board already full

    // Pick a random empty square so hints feel organic
    int chosenIndex = emptyIndices[std::rand() % emptyIndices.size()];
    return std::to_string(chosenIndex) + ":" + solvedString[chosenIndex];
}

EMSCRIPTEN_BINDINGS(sudoku_module) {
    emscripten::function("solvePuzzle", &solvePuzzle);
    emscripten::function("generatePuzzle", &getGeneratedPuzzle);
    emscripten::function("getSmartHint", &getSmartHint);
}