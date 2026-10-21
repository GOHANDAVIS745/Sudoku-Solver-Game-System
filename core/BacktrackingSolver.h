#ifndef BACKTRACKING_SOLVER_H
#define BACKTRACKING_SOLVER_H

#include "SudokuSolver.h"

class BacktrackingSolver: public SudokuSolver{
public:
	bool solve(Board& board) override;
};

#endif