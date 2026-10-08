#ifndef BOARD_H
#define BOARD_H

#include "Cell.h"
#include <string>

class Board {
private:
    Cell grid[9][9]; // Encapsulated 9x9 matrix of Cell objects

public:
    Board();

    // Rule validation
    bool isValidPlacement(int row, int col, int num) const;

    // Coordinate access and updates
    bool setCell(int row, int col, int val, bool isFixed = false);
    int getCell(int row, int col) const;
    bool isCellFixed(int row, int col) const;

    // State inspection
    bool findEmptyCell(int &row, int &col) const;

    // Helpers
    void display() const;
    void loadFromString(const std::string& puzzle);
};

#endif