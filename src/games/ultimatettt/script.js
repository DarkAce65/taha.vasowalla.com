import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

const player1Class = 'red';
const player2Class = 'blue';

let player = 0;
let winner = null;
const state = [[{ wonBy: null, subBoard: [[]] }]];
for (let boardRow = 0; boardRow < 3; boardRow++) {
  state[boardRow] = [];
  for (let boardCol = 0; boardCol < 3; boardCol++) {
    state[boardRow][boardCol] = { wonBy: null, subBoard: [] };
    for (let row = 0; row < 3; row++) {
      state[boardRow][boardCol].subBoard[row] = [];
      for (let col = 0; col < 3; col++) {
        state[boardRow][boardCol].subBoard[row][col] = null;
      }
    }
  }
}

const isBoardWon = (board) => {
  for (let i = 0; i < 3; i++) {
    const firstOfRow = board[i][0];
    const firstOfColumn = board[0][i];
    if (firstOfRow !== null && firstOfRow === board[i][1] && firstOfRow === board[i][2]) {
      return true;
    }
    if (firstOfColumn !== null && firstOfColumn === board[1][i] && firstOfColumn === board[2][i]) {
      return true;
    }
  }

  if (
    board[1][1] !== null &&
    ((board[1][1] === board[0][0] && board[1][1] === board[2][2]) ||
      (board[1][1] === board[0][2] && board[1][1] === board[2][0]))
  ) {
    return true;
  }

  return false;
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const cells = document.querySelectorAll('#board .cell');

  const resetState = () => {
    player = 0;
    winner = null;
    for (let boardRow = 0; boardRow < 3; boardRow++) {
      for (let boardCol = 0; boardCol < 3; boardCol++) {
        state[boardRow][boardCol].wonBy = null;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            state[boardRow][boardCol].subBoard[row][col] = null;
          }
        }
      }
    }

    const turnIndicator = document.querySelector('#turn');
    turnIndicator.textContent = player === 0 ? "red's" : "blue's";
    turnIndicator.classList.remove(player2Class, player1Class);
    turnIndicator.classList.add(player === 0 ? player1Class : player2Class);

    cells.forEach((cell) => cell.classList.add('possible'));
  };

  const pickCell = (p, { boardRow, boardCol, row, col }) => {
    if (p !== 0 && p !== 1) {
      throw new Error(`Invalid player: ${p}`);
    }

    if (state[boardRow][boardCol].wonBy !== null) {
      throw new Error(
        `Board at [${boardRow}][${boardCol}] is already won by ${state[boardRow][boardCol].wonBy}`
      );
    }
    if (state[boardRow][boardCol].subBoard[row][col] !== null) {
      throw new Error(
        `Cell at [${boardRow}][${boardCol}][${row}][${col}] is already claimed by ${state[boardRow][boardCol].subBoard[row][col]}`
      );
    }

    if (p === 0) {
      player = 1;
    } else {
      player = 0;
    }

    const turnIndicator = document.querySelector('#turn');
    turnIndicator.textContent = player === 0 ? "red's" : "blue's";
    turnIndicator.classList.remove(player2Class, player1Class);
    turnIndicator.classList.add(player === 0 ? player1Class : player2Class);

    state[boardRow][boardCol].subBoard[row][col] = p;
    document
      .querySelector(
        `.cell[data-board-row="${boardRow}"][data-board-column="${boardCol}"][data-row="${row}"][data-column="${col}"]`
      )
      .classList.add(p === 0 ? player1Class : player2Class);

    if (isBoardWon(state[boardRow][boardCol].subBoard)) {
      state[boardRow][boardCol].wonBy = p;
      document
        .querySelector(`.subBoard[data-board-row="${boardRow}"][data-board-column="${boardCol}"]`)
        .classList.add(p === 0 ? player1Class : player2Class);
    }

    if (isBoardWon(state.map((stateRow) => stateRow.map((stateCol) => stateCol.wonBy)))) {
      document
        .querySelectorAll('.cell.possible')
        .forEach((element) => element.classList.remove('possible'));
      winner = p;
      UIkit.notification(`${winner === 0 ? 'Red' : 'Blue'} has won!`, 'success');
      return;
    }

    if (state[row][col].wonBy === null) {
      document
        .querySelectorAll(
          `.cell.possible, .cell[data-board-row="${row}"][data-board-column="${col}"]`
        )
        .forEach((element) => {
          if (
            element.dataset.boardRow === `${row}` &&
            element.dataset.boardColumn === `${col}` &&
            !element.classList.contains(player1Class) &&
            !element.classList.contains(player2Class)
          ) {
            element.classList.add('possible');
          } else {
            element.classList.remove('possible');
          }
        });
    } else {
      document.querySelectorAll('.cell').forEach((cell) => {
        let { boardRow: boardR, boardColumn: boardC, row: r, column: c } = cell.dataset;
        boardR = parseInt(boardR, 10);
        boardC = parseInt(boardC, 10);
        r = parseInt(r, 10);
        c = parseInt(c, 10);
        if (state[boardR][boardC].wonBy === null && state[boardR][boardC].subBoard[r][c] === null) {
          cell.classList.add('possible');
        } else {
          cell.classList.remove('possible');
        }
      });
    }
  };

  resetState();

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      let { boardRow, boardColumn: boardCol, row, column: col } = cell.dataset;
      if (
        winner !== null ||
        state[boardRow][boardCol].subBoard[row][col] !== null ||
        !cell.classList.contains('possible')
      ) {
        return;
      }

      boardRow = parseInt(boardRow, 10);
      boardCol = parseInt(boardCol, 10);
      row = parseInt(row, 10);
      col = parseInt(col, 10);
      pickCell(player, { boardRow, boardCol, row, col });
    });
  });
});
