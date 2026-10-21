#include "PuzzleGenerator.h"
#include "SudokuSolver.h"
#include <vector>
#include <algorithm>
#include <random>
#include <chrono>

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

Board generateSudoku(int difficultyLevel) {
    Board board;
    RandomGenerator generator;
    generator.solve(board);

    int removeCount = 0;
    switch (difficultyLevel) {
        case 1: removeCount = 40; break; // Easy
        case 2: removeCount = 50; break; // Medium
        case 3: removeCount = 60; break; // Hard
        default: removeCount = 40; break;
    }

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