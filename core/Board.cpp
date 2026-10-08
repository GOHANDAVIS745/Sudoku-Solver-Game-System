#include "Board.h"
#include <iostream>

Board::Board() {
    // Initialize an empty 9x9 grid
    for (int r = 0; r < 9; ++r) {
        for (int c = 0; c < 9; ++c) {
            grid[r][c] = Cell(0, false);
        }
    }
}

bool Board::setCell(int row, int col, int val, bool isFixed) {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) return false;
    grid[row][col].setIsFixed(isFixed);
    return grid[row][col].setValue(val);
}

int Board::getCell(int row, int col) const {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) return -1;
    return grid[row][col].getValue();
}

bool Board::isCellFixed(int row, int col) const {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) return false;
    return grid[row][col].getIsFixed();
}

bool Board::isValidPlacement(int row, int col, int num) const {
    // 1. Check Row & Column uniqueness
    for (int i = 0; i < 9; ++i) {
        if (grid[row][i].getValue() == num) return false;
        if (grid[i][col].getValue() == num) return false;
    }

    // 2. Check 3x3 Subgrid uniqueness
    int startRow = row - (row % 3);
    int startCol = col - (col % 3);

    for (int r = 0; r < 3; ++r) {
        for (int c = 0; c < 3; ++c) {
            if (grid[startRow + r][startCol + c].getValue() == num) {
                return false;
            }
        }
    }

    return true;
}

bool Board::findEmptyCell(int &row, int &col) const {
    for (row = 0; row < 9; ++row) {
        for (col = 0; col < 9; ++col) {
            if (grid[row][col].getValue() == 0) {
                return true; // Found an unfilled cell
            }
        }
    }
    return false; // Board is full
}

void Board::loadFromString(const std::string& puzzle) {
    for (int i = 0; i < 81 && i < static_cast<int>(puzzle.length()); ++i) {
        int val = puzzle[i] - '0';
        int r = i / 9;
        int c = i % 9;
        if (val >= 1 && val <= 9) {
            setCell(r, c, val, true);
        } else {
            setCell(r, c, 0, false);
        }
    }
}

void Board::display() const {
    std::cout << "\n+-------+-------+-------+\n";
    for (int r = 0; r < 9; ++r) {
        std::cout << "| ";
        for (int c = 0; c < 9; ++c) {
            int val = grid[r][c].getValue();
            if (val == 0) std::cout << ". ";
            else std::cout << val << " ";

            if ((c + 1) % 3 == 0) std::cout << "| ";
        }
        std::cout << "\n";
        if ((r + 1) % 3 == 0) {
            std::cout << "+-------+-------+-------+\n";
        }
    }
}