/**
 * Clase principal del juego Tres en Raya
 * Contiene la lógica del juego y los algoritmos de IA
 */
class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X es el jugador humano
        this.gameActive = true;
        this.aiLevel = 'easy'; // Nivel por defecto
        this.metrics = {
            nodesEvaluated: 0,
            maxDepth: 0,
            moveTime: 0
        };
        
        this.initElements();
        this.initEventListeners();
        this.renderBoard();
    }
    
    /**
     * Inicializa los elementos del DOM
     */
    initElements() {
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.resetButton = document.getElementById('reset');
        
        // Botones de dificultad
        this.easyButton = document.getElementById('easy');
        this.mediumButton = document.getElementById('medium');
        this.hardButton = document.getElementById('hard');
        
        // Elementos de métricas
        this.timeMetric = document.getElementById('time-metric');
        this.movesMetric = document.getElementById('moves-metric');
        this.nodesMetric = document.getElementById('nodes-metric');
        this.depthMetric = document.getElementById('depth-metric');
        
        // Generar celdas del tablero
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            this.boardElement.appendChild(cell);
        }
        this.cells = document.querySelectorAll('.cell');
    }
    
    /**
     * Inicializa los event listeners
     */
    initEventListeners() {
        // Click en celdas
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        // Botón de reinicio
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Selectores de dificultad
        this.easyButton.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumButton.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardButton.addEventListener('click', () => this.setDifficulty('hard'));
    }
    
    /**
     * Maneja el click en una celda
     * @param {HTMLElement} cell - Elemento HTML de la celda clickeada
     */
    handleCellClick(cell) {
        const index = parseInt(cell.dataset.index);
        
        // Validar movimiento
        if (!this.gameActive || this.board[index] !== null || this.currentPlayer !== 'X') {
            return;
        }
        
        // Realizar movimiento del jugador
        this.makeMove(index, 'X');
        
        // Verificar si el juego continúa
        if (this.gameActive) {
            // Turno de la IA después de un breve retraso para mejor UX
            setTimeout(() => this.aiTurn(), 500);
        }
    }
    
    /**
     * Realiza un movimiento en el tablero
     * @param {number} index - Índice de la celda (0-8)
     * @param {string} player - Jugador ('X' u 'O')
     */
    makeMove(index, player) {
        this.board[index] = player;
        this.renderBoard();
        
        // Verificar estado del juego
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.isBoardFull()) {
            this.endGame(null); // Empate
        } else {
            this.currentPlayer = player === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }
    
    /**
     * Turno de la IA
     */
    aiTurn() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;
        
        // Reiniciar métricas
        this.resetMetrics();
        const startTime = performance.now();
        
        let move;
        switch (this.aiLevel) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getHeuristicMove();
                break;
            case 'hard':
                move = this.getMinimaxMove();
                break;
        }
        
        // Calcular tiempo de movimiento
        this.metrics.moveTime = performance.now() - startTime;
        this.updateMetrics();
        
        // Realizar movimiento
        if (move !== null && move !== undefined) {
            this.makeMove(move, 'O');
        }
    }
    
    /**
     * Algoritmo de IA nivel básico: movimiento aleatorio
     * @returns {number} Índice del movimiento
     */
    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(val => val !== null);
        
        if (emptyCells.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
    
    /**
     * Algoritmo de IA nivel intermedio: heurística de un paso
     * @returns {number} Índice del movimiento
     */
    getHeuristicMove() {
        // 1. Buscar movimiento ganador
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const boardCopy = [...this.board];
                boardCopy[i] = 'O';
                if (this.checkWinnerOnBoard(boardCopy)) {
                    return i;
                }
            }
        }
        
        // 2. Bloquear jugador si tiene movimiento ganador
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                const boardCopy = [...this.board];
                boardCopy[i] = 'X';
                if (this.checkWinnerOnBoard(boardCopy)) {
                    return i;
                }
            }
        }
        
        // 3. Estrategia básica: centro, esquinas, luego bordes
        const movePriority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        for (const move of movePriority) {
            if (this.board[move] === null) {
                return move;
            }
        }
        
        return null;
    }
    
    /**
     * Algoritmo de IA nivel avanzado: Minimax con poda alfa-beta
     * @returns {number} Índice del movimiento
     */
    getMinimaxMove() {
        this.metrics.nodesEvaluated = 0;
        this.metrics.maxDepth = 0;
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Probar todos los movimientos posibles
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    /**
     * Algoritmo Minimax con poda alfa-beta
     * @param {Array} board - Tablero actual
     * @param {number} depth - Profundidad actual
     * @param {boolean} isMaximizing - Si es turno del maximizador
     * @param {number} alpha - Valor alpha para poda
     * @param {number} beta - Valor beta para poda
     * @returns {number} Puntuación del nodo
     */
    minimax(board, depth, isMaximizing, alpha, beta) {
        this.metrics.nodesEvaluated++;
        this.metrics.maxDepth = Math.max(this.metrics.maxDepth, depth);
        
        // Verificar estado terminal
        const winner = this.checkWinnerOnBoard(board);
        if (winner === 'O') return 10 - depth; // Premio por ganar rápido
        if (winner === 'X') return depth - 10;  // Castigo por perder lento
        if (this.isBoardFullOnBoard(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false, alpha, beta);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) break; // Poda beta
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true, alpha, beta);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) break; // Poda alfa
                }
            }
            return bestScore;
        }
    }
    
    /**
     * Verifica si hay un ganador en el tablero actual
     * @returns {string|null} 'X', 'O' o null si no hay ganador
     */
    checkWinner() {
        return this.checkWinnerOnBoard(this.board);
    }
    
    /**
     * Verifica si hay un ganador en un tablero específico
     * @param {Array} board - Tablero a verificar
     * @returns {string|null} 'X', 'O' o null si no hay ganador
     */
    checkWinnerOnBoard(board) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }
    
    /**
     * Verifica si el tablero está lleno (empate)
     * @returns {boolean}
     */
    isBoardFull() {
        return this.isBoardFullOnBoard(this.board);
    }
    
    /**
     * Verifica si un tablero específico está lleno
     * @param {Array} board - Tablero a verificar
     * @returns {boolean}
     */
    isBoardFullOnBoard(board) {
        return board.every(cell => cell !== null);
    }
    
    /**
     * Finaliza el juego
     * @param {string|null} winner - 'X', 'O' o null para empate
     */
    endGame(winner) {
        this.gameActive = false;
        
        if (winner) {
            this.statusElement.textContent = `¡${winner === 'X' ? 'Ganaste' : 'La IA ganó'}!`;
            // Resaltar combinación ganadora
            this.highlightWinningCells();
        } else {
            this.statusElement.textContent = '¡Empate!';
        }
    }
    
    /**
     * Resalta las celdas de la combinación ganadora
     */
    highlightWinningCells() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.cells[a].classList.add('win');
                this.cells[b].classList.add('win');
                this.cells[c].classList.add('win');
                break;
            }
        }
    }
    
    /**
     * Actualiza el estado del juego en la UI
     */
    updateStatus() {
        if (this.gameActive) {
            this.statusElement.textContent = 
                this.currentPlayer === 'X' ? 'Tu turno (Jugador X)' : 'Turno de la IA (Jugador O)';
        }
    }
    
    /**
     * Actualiza las métricas en la UI
     */
    updateMetrics() {
        this.timeMetric.textContent = this.metrics.moveTime.toFixed(2);
        this.movesMetric.textContent = this.board.filter(cell => cell !== null).length;
        this.nodesMetric.textContent = this.metrics.nodesEvaluated;
        this.depthMetric.textContent = this.metrics.maxDepth;
    }
    
    /**
     * Reinicia las métricas
     */
    resetMetrics() {
        this.metrics = {
            nodesEvaluated: 0,
            maxDepth: 0,
            moveTime: 0
        };
        this.updateMetrics();
    }
    
    /**
     * Renderiza el tablero en la UI
     */
    renderBoard() {
        this.cells.forEach((cell, index) => {
            cell.textContent = this.board[index] || '';
            cell.className = 'cell';
            if (this.board[index] === 'X') cell.classList.add('x');
            if (this.board[index] === 'O') cell.classList.add('o');
        });
    }
    
    /**
     * Establece el nivel de dificultad de la IA
     * @param {string} level - 'easy', 'medium' o 'hard'
     */
    setDifficulty(level) {
        this.aiLevel = level;
        
        // Actualizar botones activos
        this.easyButton.classList.remove('active');
        this.mediumButton.classList.remove('active');
        this.hardButton.classList.remove('active');
        
        if (level === 'easy') this.easyButton.classList.add('active');
        if (level === 'medium') this.mediumButton.classList.add('active');
        if (level === 'hard') this.hardButton.classList.add('active');
        
        // Reiniciar juego si está en progreso
        if (this.gameActive && this.currentPlayer === 'O') {
            this.aiTurn();
        }
    }
    
    /**
     * Reinicia el juego
     */
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.resetMetrics();
        this.renderBoard();
        this.updateStatus();
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
});