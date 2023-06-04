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
    // console.log("***** ID: " + this.getID());
    let board = this.perception;
    // console.log("====> board: " + board);
    let size = board.length;
    // console.log("====> size: " + size);
    let available = getEmptyHex(board);
    // console.log("====> available: " + available);
    let nTurn = size * size - available.length;
    // console.log("====> nTurn: " + nTurn);
    return moveGame(board, size, available, nTurn, this.getID())

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


function moveGame(board, size, available, nTurn, player) {
  if (nTurn == 0) {
    return [Math.floor(size / 2), Math.floor(size / 2) - 1];
  } else if (nTurn == 1) {
    return [Math.floor(size / 2), Math.floor(size / 2)];
  }

  let profundidad = 8;

  if (nTurn % 2 == 0) {
    let [evaluation, bestMove] = minmax(board, profundidad, true, player)
    let [row, col] = bestMove;
    return [row, col];
  } else {
    board = transposeHex(board)
    let [evaluation, bestMove] = minmax(board, profundidad, true, player)
    let [row, col] = bestMove;
    return [col, row];
  }

}


function twoBridgesScore(board, player) {
  let path0 = boardS.boardPath(board);
  let twoBridges = 0;
  let twoBridgesAdversary = 0;
  let score  = 0;
  if (!path0) {
    score = -999999999
  } else {
    if (path0.length === 2) {
      score = 999999999;
    } else {
      let path1 = boardS.boardPath(transposeHex(board));
      if (!path1) {
        score = 999999999
      } else {
        let startIndex = 1; 
        let endIndex = path0.length - 1; 
        
        for (let i = startIndex; i < endIndex; i++) {
          const squareId = path0[i];
          let row = Math.floor(squareId / board.length)
          let col = squareId % board.length
          
          try {
            if (board[row-1][col+2] === '1') twoBridges+=2;
          } catch (error) {
          }    
          try {
            if (board[row+1][col-2] === '1') twoBridges+=2;
          } catch (error) {
          }    
          try {
            if (board[row-1][col-1] === '1') twoBridges++;
          } catch (error) {
          }    
          try {
            if (board[row+1][col+1] === '1') twoBridges++;
          } catch (error) {
          }    
          try {
            if (board[row+2][col-1] === '1') twoBridges++;
          } catch (error) {
          }    
          try {
            if (board[row-2][col+1] === '1') twoBridges++;
          } catch (error) {
          }   
        }        
        
        endIndex = path1.length - 1; 
        
        for (let i = startIndex; i < endIndex; i++) {
          const squareId = path0[i];
          let row = Math.floor(squareId / board.length)
          let col = squareId % board.length
          
          try {
            if (board[row-1][col+2] === '1') twoBridgesAdversary+=2;
          } catch (error) {
          }    
          try {
            if (board[row+1][col-2] === '1') twoBridgesAdversary+=2;
          } catch (error) {
          }    
          try {
            if (board[row-1][col-1] === '1') twoBridgesAdversary++;
          } catch (error) {
          }    
          try {
            if (board[row+1][col+1] === '1') twoBridgesAdversary++;
          } catch (error) {
          }    
          try {
            if (board[row+2][col-1] === '1') twoBridgesAdversary++;
          } catch (error) {
          }    
          try {
            if (board[row-2][col+1] === '1') twoBridgesAdversary++;
          } catch (error) {
          }   
        }                
        
      }
    }
  }

  
  score = twoBridges-twoBridgesAdversary;          
  
  return player === '1' ? score : -score;
}
/*

*/
let contadorIteraciones = 0;
function centralControlScore(board, player){

  let path0 = boardS.boardPath(board);
  let path1 = boardS.boardPath(transposeHex(board));

  // let control = 0;
  // let controlAdversary = 0;

  // path0.forEach(squareId => {
  //   let row = Math.floor(squareId / board.length)
  //   let col = squareId % board.length
  //   if (row >= 3 && row <= 7 && col >= 3 && col <= 6) control++;
  // })
  // path1.forEach(squareId => {
  //   let row = Math.floor(squareId / board.length)
  //   let col = squareId % board.length
  //   if (row >= 3 && row <= 7 && col >= 3 && col <= 6) controlAdversary++;
  // })
  // score = control-controlAdversary;          
  
  // return player === '1' ? score : -score;
}

function minmax(board, profundidad, maxplayer, player, alfa = Number.MIN_SAFE_INTEGER, beta = Number.MAX_SAFE_INTEGER) {
  
  if(maxplayer){
    let movements = boardS.boardPath(board)
    if(movements === null){
      return [boardS.boardScore(board, player), null]
    }else{
      if(profundidad === 0 || movements.length === 2){
        return [boardS.boardScore(board, player) + twoBridgesScore(board, player) + evaluateConnectionsInCornersScore(board, player), null];
      }
    }
  }else {    
    let movements = boardS.boardPath(transposeHex(board))
    if(movements === null){
      return [boardS.boardScore(board, player), null]
    }else{
      if(profundidad === 0 || movements.length === 2) {
        return [boardS.boardScore(board, player) + twoBridgesScore(board, player) + evaluateConnectionsInCornersScore(board, player), null];
      }
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
      let evaluation = minmax(temp_board, profundidad - 1, false, player, alfa, beta)[0]
      if(evaluation > max_eval){
        max_eval = evaluation;
        bestMove = [row, col];
      }

      // Actualiza el valor de alfa con el máximo entre el valor actual y evaluation.
      alfa = Math.max(alfa, evaluation);
      // Realiza la poda alfa-beta verificando si beta es menor o igual a alfa. Si se cumple, se interrumpe el bucle.
      if (beta <= alfa) {
        break;
      }
    }
    return [max_eval, bestMove];    
 
  } else {
    let min_eval = Number.POSITIVE_INFINITY;
    let bestMove = null;
    // Cuando no es el turno del jugador maximizador, se transpone el tablero utilizando la función transposeHex
    // para intercambiar los roles de los jugadores
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

    // El ciclo for itera sobre los movimientos disponibles (possibleMoves) y realiza la transposición de cada movimiento.
    // Este proceso de transposición de movimientos permite que el algoritmo continúe evaluando el tablero correctamente, 
    // considerando el cambio de roles entre los jugadores.
    for(let j = startIndex; j < endIndex; j++){
      let squareId = possibleMoves[j];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let newId = col * board.length + row;
      possibleMoves[j] = newId;
    }
    
    // Realiza los mismos pasos que en el caso anterior, pero cambiando los roles de maximización y minimización.
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let temp_board = cloneDeep(board);
      temp_board[row][col] = '2'
      let evaluation = minmax(temp_board, profundidad - 1, true, player, alfa, beta)[0]
      if (evaluation < min_eval) {
        min_eval = evaluation;
        bestMove = [row, col];
      }

      // Actualiza el valor de beta con el minimo entre el valor actual y evaluation.
      beta = Math.min(beta, evaluation);
      // Realiza la poda alfa-beta verificando si beta es menor o igual a alfa. Si se cumple, se interrumpe el bucle.
      if (beta <= alfa) {
        break; 
      }
    }
    return [min_eval, bestMove];
  }
}


function evaluateConnectionsInCornersScore(board, player) {
  const boardSize = board.length;

  // Se define las coordenadas de las esquinas
  const corners = [
    [0, 0],
    [0, boardSize - 1],
    [boardSize - 1, 0],
    [boardSize - 1, boardSize - 1]
  ];

  let score = 0;

  // Se verifica si las piedras del jugador forman conexiones en las esquinas
  for (const [row, col] of corners) {
    if (board[row][col] === player) {
      // Se verificar si hay una conexión en la esquina actual
      const isConnected = checkCornerConnection(board, row, col, player);
      if (isConnected) {
        // Se asignar un puntaje más alto si hay una conexión en la esquina
        score += 100;
      }
    }
  }

  // Se da valor positivo al jugador 1
  return player === '1' ? score : -score;
}

// Función para verificar si hay una conexión en la esquina dada
function checkCornerConnection(board, row, col, player) {
  const boardSize = board.length;

  // Se verifican las conexiones en las direcciones adyacentes a la esquina
  const directions = [
    [[0, 1], [1, 0]],  // Derecha e inferior
    [[1, -1], [1, 0]], // Inferior derecha e inferior
    [[0, -1], [-1, 0]] // Izquierda y superior
  ];

  for (const [dir1, dir2] of directions) {
    let connected = true;
    let currRow = row;
    let currCol = col;

    // Se verifica si las piedras forman una conexión en la dirección actual
    for (let i = 0; i < boardSize; i++) {
      currRow += dir1[0];
      currCol += dir1[1];

      // Se verifica los límites del tablero, si no se cume se detiene la iteracion
      if (currRow < 0 || currRow >= boardSize || currCol < 0 || currCol >= boardSize) {
        break;
      }

      if (board[currRow][currCol] !== player) {
        connected = false;
        break;
      }
    }

    // Si no se conecta, se continua con la siguiente iteración
    if (!connected) {
      continue;
    }

    // Si si está conectado, se verifica si hay una conexión diagonal en la dirección actual
    currRow = row;
    currCol = col;

    for (let i = 0; i < boardSize; i++) {
      currRow += dir2[0];
      currCol += dir2[1];

      // Se verifica los límites del tablero
      if (currRow < 0 || currRow >= boardSize || currCol < 0 || currCol >= boardSize) {
        break;
      }

      if (board[currRow][currCol] !== player) {
        connected = false;
        break;
      }
    }

    if (connected) {
      return true;
    }
  }

  return false;
}
