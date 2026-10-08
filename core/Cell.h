#ifndef CELL_H
#define CELL_H

class Cell {
private:
    int value;      // 0 means empty, 1 to 9 are valid entries
    bool isFixed;   // true if this was a starting clue given by the puzzle

public:
    // Constructor with default parameters
    Cell(int val = 0, bool fixed = false);

    // Getters (marked 'const' because they do not modify the object)
    int getValue() const;
    bool getIsFixed() const;

    // Setters
    bool setValue(int val);
    void setIsFixed(bool fixed);
    void clear();
};

#endif