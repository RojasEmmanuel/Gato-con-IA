document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const difficultySelect = document.getElementById('difficulty');
    
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let winningCombination = [];
    
    // Combinaciones ganadoras
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];
    
    // Inicializar el juego
    function initializeGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        winningCombination = [];
        status.textContent = 'Tu turno (X)';
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-line');
        });
    }
    
    // Manejar el click en una celda
    function handleCellClick(e) {
        if (!gameActive) return;
        
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '') return;
        
        makeMove(clickedCell, clickedCellIndex, 'X');
        
        if (checkWin('X')) {
            handleGameEnd('X');
            return;
        }
        
        if (!gameState.includes('')) {
            handleGameEnd(null);
            return;
        }
        
        currentPlayer = 'O';
        status.textContent = 'Turno de la IA (O)';
        
        setTimeout(() => {
            makeAIMove();
            
            if (checkWin('O')) {
                handleGameEnd('O');
                return;
            }
            
            if (!gameState.includes('')) {
                handleGameEnd(null);
                return;
            }
            
            currentPlayer = 'X';
            status.textContent = 'Tu turno (X)';
        }, 500);
    }
    
    // Realizar un movimiento
    function makeMove(cell, index, player) {
        gameState[index] = player;
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }
    
    // Verificar si hay un ganador
    function checkWin(player) {
        for (const condition of winningConditions) {
            if (condition.every(index => gameState[index] === player)) {
                winningCombination = condition;
                highlightWinningCells(condition);
                return true;
            }
        }
        return false;
    }
    
    // Resaltar celdas ganadoras
    function highlightWinningCells(cellsToHighlight) {
        cellsToHighlight.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('winning-line');
        });
    }
    
    // Manejar el final del juego
    function handleGameEnd(winner) {
        gameActive = false;
        
        if (winner === 'X') {
            status.textContent = '¡Ganaste!';
        } else if (winner === 'O') {
            status.textContent = '¡La IA ganó!';
        } else {
            status.textContent = '¡Empate!';
        }
    }
    
    // Movimiento de la IA
    function makeAIMove() {
        const difficulty = difficultySelect.value;
        let moveIndex;
        
        if (difficulty === 'easy') {
            moveIndex = getRandomMove();
        } else if (difficulty === 'medium') {
            moveIndex = Math.random() > 0.5 ? getRandomMove() : findBestMove();
        } else {
            moveIndex = findBestMove();
        }
        
        const cell = document.querySelector(`.cell[data-index="${moveIndex}"]`);
        makeMove(cell, moveIndex, 'O');
    }
    
    // Obtener movimiento aleatorio
    function getRandomMove() {
        const availableMoves = gameState
            .map((val, idx) => val === '' ? idx : null)
            .filter(val => val !== null);
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Algoritmo Minimax para encontrar el mejor movimiento
    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    // Implementación de Minimax con poda alfa-beta
    function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
        // Verificar si hay un ganador
        const xWin = winningConditions.some(cond => cond.every(i => board[i] === 'X'));
        const oWin = winningConditions.some(cond => cond.every(i => board[i] === 'O'));
        
        if (oWin) return 10 - depth;
        if (xWin) return -10 + depth;
        if (!board.includes('')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false, alpha, beta);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) break;
                }
            }
            
            return bestScore;
        } else {
            let bestScore = Infinity;
            
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true, alpha, beta);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) break;
                }
            }
            
            return bestScore;
        }
    }
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    resetButton.addEventListener('click', initializeGame);
    
    // Inicializar el juego al cargar
    initializeGame();
});