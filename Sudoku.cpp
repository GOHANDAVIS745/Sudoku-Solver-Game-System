#include <iostream>
#include <vector>

using namespace std;

class Cell{
private:
	char val;
public:
};

// class Solution {
// public:
//     bool ss(vector<vector<char>>& board, int pos){
//         if(pos>=82) return true;
//         int I=(pos-1)/9;
//         int J=(pos-1)%9;
//         if(board[I][J]=='.'){
//             for(int i=1;i<=9;i++){
//                 bool f=true;
//                 char c=i+'0';
//                 for(int j=0;j<9;j++){
//                     if((board[I][j]==c && j!=J) ||
//                     (board[j][J]==c && j!=I) ||
//                     (board[3*(I/3) + (j/3)][3*(J/3) + (j%3)]==c && j!=(3*I+J))){
//                         f=false;
//                         break;
//                     }
//                 }

//                 if(f){
//                     board[I][J]=c;
//                     if(ss(board, pos+1)) return true;
//                     board[I][J]='.';
//                 }
//             }
//             return false;
//         }
//         return ss(board, pos+1);
//     }

//     void solveSudoku(vector<vector<char>>& board) {
//         ss(board, 1);
//     }
// };