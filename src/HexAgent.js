const Agent = require('ai-agents').Agent;
const boardS = require('./boardScore');
const transposeHex = require('./transposeHex');
const cloneDeep = require('lodash/cloneDeep');

class HexAgent extends Agent {
  constructor(value) {
    super(value);
    this.cache = {};
  }

  /**
   * return a new move. The move is an array of two integers, representing the
   * row and column number of the hex to play. If the given movement is not valid,
   * the Hex controller will perform a random valid movement for the player
   * Example: [1, 1]
   */
  send() {
    let board = this.perception;
    let size = board.length;
    let available = getEmptyHex(board);
    let nTurn = size * size - available.length;
    return moveGame(board, size, available, nTurn)

  }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
  let result = [];
  let size = board.length;
  for (let k = 0; k < size; k++) {
    for (let j = 0; j < size; j++) {
      if (board[k][j] === 0) {
        result.push(k * size + j);
      }
    }
  }
  return result;
}


function moveGame(board, size, available, nTurn) {
  if (nTurn == 0) {
    return [Math.floor(size / 2), Math.floor(size / 2) - 1];
  } else if (nTurn == 1) {
    return [Math.floor(size / 2), Math.floor(size / 2)];
  }

  let profundidad = 8;

  if (nTurn % 2 == 0) {
    let [evaluation, bestMove] = minmax(board, profundidad, true)
    let [row, col] = bestMove;
    return [row, col];
  } else {
    board = transposeHex(board)
    let [evaluation, bestMove] = minmax(board, profundidad, true)
    let [row, col] = bestMove;
    return [col, row];
  }

}

function getOccupiedCells(board) {
  const occupiedCells = [];
  const rows = board.length;
  const columns = board[0].length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (board[row][col] === '1') {
        const cellId = row * columns + col;
        occupiedCells.push(cellId);
      }
    }
  }

  return occupiedCells;
}


function twoBridgesScore(board, player) {
  let occupiedCells = getOccupiedCells(board);
  console.log(occupiedCells);
  let twoBridges = 0;
  let twoBridgesAdversary = 0;
  let score = 0;
  let adversaryBoard = transposeHex(board);
  let adversaryOcupiedCells = getOccupiedCells(adversaryBoard);
  console.log(adversaryOcupiedCells);

  occupiedCells.forEach((cellId) => {
    let row = Math.floor(cellId / board.length);
    let col = cellId % board.length;
    try {
      if (board[row - 1][col + 2] === '1') {
        twoBridges += 4;
      }
    } catch (error) {}

    try {
      if (board[row + 1][col - 2] === '1') {
        twoBridges += 4;
      }
    } catch (error) {}

    try {
      if (board[row - 1][col - 1] === '1') {
        twoBridges += 2;
      }
    } catch (error) {}

    try {
      if (board[row + 1][col + 1] === '1') {
        twoBridges += 2;
      }
    } catch (error) {}

    try {
      if (board[row + 2][col - 1] === '1') {
        twoBridges += 2
      }
    } catch (error) {}

    try {
      if (board[row - 2][col + 1] === '1') {
        twoBridges += 2;
      }
    } catch (error) {}
  });

  adversaryOcupiedCells.forEach((cellId) => {
    let row = Math.floor(cellId / board.length);
    let col = cellId % board.length;
    try {
      if (adversaryBoard[row - 1][col + 2] === '1') {
        twoBridgesAdversary += 4;
      }
    } catch (error) {}

    try {
      if (adversaryBoard[row + 1][col - 2] === '1') {
        twoBridgesAdversary += 4;
      }
    } catch (error) {}

    try {
      if (adversaryBoard[row - 1][col - 1] === '1') {
        twoBridgesAdversary+=2;
      }
    } catch (error) {}

    try {
      if (adversaryBoard[row + 1][col + 1] === '1') {
        twoBridgesAdversary+=2;
      }
    } catch (error) {}

    try {
      if (adversaryBoard[row + 2][col - 1] === '1') {
        twoBridgesAdversary+=2;
      }
    } catch (error) {}

    try {
      if (adversaryBoard[row - 2][col + 1] === '1') {
        twoBridgesAdversary+=2;
      }
    } catch (error) {}
  });

  score = twoBridges/2 - twoBridgesAdversary/2;

  if (score !== 0) {
    console.log("score: ", score, twoBridges, twoBridgesAdversary);
    console.log(board);
    process.exit();
  }

  return player === '1' ? score : -score;
}

  
let testboard =  [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, '1', 0],
  [0, 0, 0, '1', 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
]
//console.log(twoBridgesScore(testboard, '1'))
/*

*/

function minmax(board, profundidad, maxplayer, alfa = Number.MIN_SAFE_INTEGER, beta = Number.MAX_SAFE_INTEGER) {

  if(maxplayer){
    let movements = boardS.boardPath(board)
    if(movements === null){
      return [boardS.boardScore(board, '1'), null]
    }else{
      if(profundidad === 0 || movements.length === 2){
        return [boardS.boardScore(board, '1')+twoBridgesScore(board, '1'), null]
      }
    }
  }else {    
      let movements = boardS.boardPath(transposeHex(board))
      if(movements === null){
        return [boardS.boardScore(board, '1'), null]
      }else
        if(profundidad === 0 || movements.length === 2) {
        return [boardS.boardScore(board, '1')+twoBridgesScore(board, '1'), null];
      }
    
  }
  


  if (maxplayer) {
    let max_eval = Number.NEGATIVE_INFINITY;
    let bestMove = null;
    let possibleMoves = boardS.boardPath(board);
    let startIndex = 1; 
    let endIndex = possibleMoves.length - 1; 
    let twoBridgesCandidates = [];
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length    
      try {
        if (board[row-1][col+2] === 0) twoBridgesCandidates.push(row-1 * board.length + col+2);
      } catch (error) {
      }    
      try {
        if (board[row+1][col-2] === 0) twoBridgesCandidates.push(row+1 * board.length + col-2);
      } catch (error) {
      }    
      try {
        if (board[row-1][col-1] === 0) twoBridgesCandidates.push(row-1 * board.length + col-1);
      } catch (error) {
      }    
      try {
        if (board[row+1][col+1] === 0) twoBridgesCandidates.push(row+1 * board.length + col+1);
      } catch (error) {
      }    
      try {
        if (board[row+2][col-1] === 0) twoBridgesCandidates.push(row+2 * board.length + col-1);
      } catch (error) {
      }    
      try {
        if (board[row-2][col+1] === 0) twoBridgesCandidates.push(row-2 * board.length + col+1);
      } catch (error) {
      }      
    }
    possibleMoves = possibleMoves.concat(twoBridgesCandidates);
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let temp_board = cloneDeep(board);
      temp_board[row][col] = '1'
      let evaluation = minmax(temp_board, profundidad - 1, false, alfa, beta)[0]
      if(evaluation > max_eval){
        max_eval = evaluation;
        bestMove = [row, col];
      }
      alfa = Math.max(alfa, evaluation);
      if (beta <= alfa) {
        break;
      }
    }
    return [max_eval, bestMove];    
 
  } else {
    let min_eval = Number.POSITIVE_INFINITY;
    let bestMove = null;
    let possibleMoves = boardS.boardPath(transposeHex(board));
    let startIndex = 1; 
    let endIndex = possibleMoves.length - 1; 

    let twoBridgesCandidates = [];
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length    
      try {
        if (board[row-1][col+2] === 0) twoBridgesCandidates.push(row-1 * board.length + col+2);
      } catch (error) {
      }    
      try {
        if (board[row+1][col-2] === 0) twoBridgesCandidates.push(row+1 * board.length + col-2);
      } catch (error) {
      }    
      try {
        if (board[row-1][col-1] === 0) twoBridgesCandidates.push(row-1 * board.length + col-1);
      } catch (error) {
      }    
      try {
        if (board[row+1][col+1] === 0) twoBridgesCandidates.push(row+1 * board.length + col+1);
      } catch (error) {
      }    
      try {
        if (board[row+2][col-1] === 0) twoBridgesCandidates.push(row+2 * board.length + col-1);
      } catch (error) {
      }    
      try {
        if (board[row-2][col+1] === 0) twoBridgesCandidates.push(row-2 * board.length + col+1);
      } catch (error) {
      }      
    }
    possibleMoves = possibleMoves.concat(twoBridgesCandidates);

    for(let j = startIndex; j < endIndex; j++){
      let squareId = possibleMoves[j];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let newId = col * board.length + row;
      possibleMoves[j] = newId;
    }
    
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let temp_board = cloneDeep(board);
      temp_board[row][col] = '2'
      let evaluation = minmax(temp_board, profundidad - 1, true, alfa, beta)[0]
      if (evaluation < min_eval) {
        min_eval = evaluation;
        bestMove = [row, col];
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alfa) {
        break; 
      }
    }
    return [min_eval, bestMove];
  }
}
