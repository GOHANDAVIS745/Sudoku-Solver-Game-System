#ifndef PUZZLE_GENERATOR_H
#define PUZZLE_GENERATOR_H

#include "Board.h"

// Generates a puzzle based on difficulty (1 = Easy, 2 = Medium, 3 = Hard)
Board generateSudoku(int difficultyLevel);

#endif