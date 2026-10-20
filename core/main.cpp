#include "Board.h"
#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>
#include <string>

// ========================================================================
// 1. Abstract SudokuSolver Class
// ========================================================================
class SudokuSolver {
public:
    virtual ~SudokuSolver() = default;

    // Pure virtual function to enforce the contract on derived solvers
    virtual bool solve(Board& board) = 0;
};


// ========================================================================
// 2. Recursive BacktrackingSolver Implementation
// ========================================================================
class BacktrackingSolver : public SudokuSolver {
public:
    bool solve(Board& board) override {
        int row, col;
        
        // Step 1: Search for empty cells (value == 0)
        if (!board.findEmptyCell(row, col)) {
            return true; // No empty cells left, puzzle is successfully solved!
        }

        // Step 2: Iterate candidates 1 through 9
        for (int num = 1; num <= 9; ++num) {
            if (board.isValidPlacement(row, col, num)) {
                // Step 3: Place valid candidate
                // Note: isFixed is false because this is a solver guess, not a fixed puzzle clue
                board.setCell(row, col, num, false);

                // Step 4: Recurse deeper into the board
                if (solve(board)) {
                    return true;
                }

                // Step 5: Backtrack if a dead end is hit
                board.setCell(row, col, 0, false);
            }
        }
        
        // Trigger backtracking to the previous recursion depth
        return false; 
    }
};


// ========================================================================
// 3. Helper System: Random Board Generation based on Difficulty
// ========================================================================

// A specialized solver that shuffles 1-9 to generate varied full valid grids
class RandomGenerator : public SudokuSolver {
public:
    bool solve(Board& board) override {
        int r, c;
        if (!board.findEmptyCell(r, c)) return true;

        std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
        std::shuffle(nums.begin(), nums.end(), std::default_random_engine(seed));

        for (int num : nums) {
            if (board.isValidPlacement(r, c, num)) {
                board.setCell(r, c, num, false);
                if (solve(board)) return true;
                board.setCell(r, c, 0, false);
            }
        }
        return false;
    }
};

// Generates a puzzle by filling a board completely, then removing elements
Board generateSudoku(int difficultyLevel) {
    Board board;
    RandomGenerator generator;
    
    // Fill the grid completely with valid randomized placements
    generator.solve(board);

    // Determine how many cells to clear out based on difficulty
    int removeCount = 0;
    std::string diffName;
    switch (difficultyLevel) {
        case 1: removeCount = 40; diffName = "EASY"; break;
        case 2: removeCount = 50; diffName = "MEDIUM"; break;
        case 3: removeCount = 60; diffName = "HARD"; break;
        default: removeCount = 40; diffName = "EASY"; break;
    }

    std::cout << "\n--> Generating a new " << diffName << " puzzle...\n";

    // Randomly remove cells
    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::default_random_engine rng(seed);
    std::uniform_int_distribution<int> dist(0, 8);

    int count = 0;
    while (count < removeCount) {
        int r = dist(rng);
        int c = dist(rng);
        if (board.getCell(r, c) != 0) {
            board.setCell(r, c, 0, false);
            count++;
        }
    }

    // Lock the remaining cells as 'fixed' clues so the solver can't overwrite them
    for (int r = 0; r < 9; ++r) {
        for (int c = 0; c < 9; ++c) {
            int val = board.getCell(r, c);
            if (val != 0) {
                board.setCell(r, c, val, true); 
            }
        }
    }

    return board;
}


// ========================================================================
// 4. Main Program / Execution Routine
// ========================================================================
int main() {
    std::cout << "==========================================\n";
    std::cout << "      SUDOKU GENERATOR & SOLVER           \n";
    std::cout << "==========================================\n";
    
    // --- Phase 1: Valid Puzzle Validation ---
    std::cout << "Select Difficulty (1 = Easy, 2 = Medium, 3 = Hard): ";
    int choice;
    if (!(std::cin >> choice)) {
        choice = 1; // Default to easy if invalid input
    }

    Board generatedBoard = generateSudoku(choice);
    std::cout << "Initial Puzzle:\n";
    generatedBoard.display();

    std::cout << "\nAttempting to solve via Backtracking...\n";
    
    BacktrackingSolver solver;
    auto start_time = std::chrono::high_resolution_clock::now();
    
    if (solver.solve(generatedBoard)) {
        auto end_time = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double, std::milli> duration = end_time - start_time;
        
        std::cout << "Puzzle Solved Successfully in " << duration.count() << " ms!\n";
        generatedBoard.display();
    } else {
        std::cout << "Failed to solve the puzzle.\n";
    }

    // --- Phase 2: Edge-case Unsolvable Board Validation ---
    std::cout << "\n==========================================\n";
    std::cout << "    TESTING EDGE-CASE UNSOLVABLE BOARD    \n";
    std::cout << "==========================================\n";
    
    Board unsolvableBoard;
    // This board has 1-8 in the top row. The missing 9 for the top row belongs at (0,8).
    // However, cell (1,8) directly beneath it is ALREADY a 9, creating an unresolvable conflict.
    std::string badBoardStr = 
        "123456780"
        "000000009"
        "000000000"
        "000000000"
        "000000000"
        "000000000"
        "000000000"
        "000000000"
        "000000000";
        
    unsolvableBoard.loadFromString(badBoardStr);
    unsolvableBoard.display();
    
    std::cout << "\nAttempting to solve unsolvable board...\n";
    if (solver.solve(unsolvableBoard)) {
        std::cout << "[ERROR] Solver bypassed rules and solved an invalid board!\n";
    } else {
        std::cout << "[SUCCESS] Solver correctly backtracked to failure and identified the board as UNSOLVABLE.\n";
    }

    return 0;
}