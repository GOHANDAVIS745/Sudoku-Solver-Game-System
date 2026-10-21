#ifndef SUDOKU_SOLVER_H
#define SUDOKU_SOLVER_H

#include "Board.h"

class SudokuSolver {
public:
    virtual ~SudokuSolver() = default;

    // Pure virtual function to enforce the contract on derived solvers
    virtual bool solve(Board& board) = 0;
};

#endif