#include "Board.h"
#include <iostream>

int main() {
    Board board;

    // A sample puzzle string (0 denotes an empty cell)
    std::string samplePuzzle = 
        "530070000"
        "600195000"
        "098000060"
        "800060003"
        "400803001"
        "700020006"
        "060000280"
        "000419005"
        "000080079";

    std::cout << "Loading Board from string...\n";
    board.loadFromString(samplePuzzle);
    board.display();

    std::cout << "\n--- Testing Rule Validation ---\n";

    // Test 1: Cell (0, 2) is currently empty.
    // Row 0 already contains 5, 3, 7. Placing '5' must return false.
    std::cout << "Can we place 5 at (0, 2)? " 
              << (board.isValidPlacement(0, 2, 5) ? "YES" : "NO (Expected)") << "\n";

    // Test 2: In the top-left 3x3 box, 9 is already present at (2, 1). Placing '9' must return false.
    std::cout << "Can we place 9 at (0, 2)? " 
              << (board.isValidPlacement(0, 2, 9) ? "YES" : "NO (Expected)") << "\n";

    // Test 3: Candidate 1: Col 2 has no 1, Row 0 has no 1, Box has no 1. Placing '1' should return true.
    std::cout << "Can we place 1 at (0, 2)? " 
              << (board.isValidPlacement(0, 2, 1) ? "YES (Expected)" : "NO") << "\n";

    return 0;
}