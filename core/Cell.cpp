#include "Cell.h"

Cell::Cell(int val, bool fixed) : value(0), isFixed(fixed) {
    setValue(val);
}

int Cell::getValue() const {
    return value;
}

bool Cell::getIsFixed() const {
    return isFixed;
}

// Encapsulation in action: reject invalid inputs outside 0-9
bool Cell::setValue(int val) {
    if (val >= 0 && val <= 9) {
        value = val;
        return true;
    }
    return false;
}

void Cell::setIsFixed(bool fixed) {
    isFixed = fixed;
}

void Cell::clear() {
    if (!isFixed) {
        value = 0;
    }
}