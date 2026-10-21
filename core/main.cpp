#include "Board.h"
#include "BacktrackingSolver.h"
#include "SudokuSolver.h"
#include "PuzzleGenerator.h"

#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>
#include <string>


// ========================================================================
// Main Program / Execution Routine
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