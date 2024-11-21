const boardElement = document.getElementById('board');
        const statusElement = document.getElementById('status');
        const resetButton = document.getElementById('reset');
        const winSound = document.getElementById('winSound');
        const drawSound = document.getElementById('drawSound');
        const clickSound = document.getElementById('clickSound');
        const gameElement = document.getElementById('game');
        const tokenSelection = document.getElementById('tokenSelection');
        const nameInput = document.getElementById('nameInput');
        const twoPlayerButton = document.getElementById('twoPlayer');
        const computerButton = document.getElementById('computer');
        const startGameButton = document.getElementById('startGameButton');
        const tokenPrompt = document.getElementById('tokenPrompt');

        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let isGameActive = true;
        let isComputerMode = false;
        let player1Token = '';
        let player2Token = '';
        let player1Name = '';
        let player2Name = 'Computer'; // Default name for computer player
        let tokenSelectionStage = 0; // 0 for player 1, 1 for player 2

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
            [0, 4, 8], [2, 4, 6]             // diagonal
        ];

        twoPlayerButton.addEventListener('click', () => {
            isComputerMode = false;
            nameInput.style.display = 'block';
            tokenSelection.style.display = 'none';
            document.getElementById('player2Input').style.display = 'block'; // Show second player input
        });

        computerButton.addEventListener('click', () => {
            isComputerMode = true;
            nameInput.style.display = 'block';
            tokenSelection.style.display = 'none';
            document.getElementById('player2Input').style.display = 'none'; // Hide second player input
        });

        startGameButton.addEventListener('click', () => {
            player1Name = document.getElementById('player1Name').value || "Player 1";
            if (!isComputerMode) {
                player2Name = document.getElementById('player2Name').value || "Player 2";
            }
            tokenPrompt.innerText = `${player1Name}, select your token:`;
            tokenSelection.style.display = 'block';
            nameInput.style.display = 'none';
        });

        document.getElementById('tokenX').addEventListener('click', () => {
            if (tokenSelectionStage === 0) {
                player1Token = 'X';
                player2Token = 'O'; // Computer token
                tokenSelectionStage = 1;
                startGame();
            } else {
                player2Token = 'X';
                player1Token = 'O'; // Human token
                startGame();
            }
        });

        document.getElementById('tokenO').addEventListener('click', () => {
            if (tokenSelectionStage === 0) {
                player1Token = 'O';
                player2Token = 'X'; // Computer token
                tokenSelectionStage = 1;
                startGame();
            } else {
                player2Token = 'O';
                player1Token = 'X'; // Human token
                startGame();
            }
        });

        const startGame = () => {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = player1Token;
            isGameActive = true;
            statusElement.innerText = '';
            gameElement.style.display = 'block';
            tokenSelection.style.display = 'none';
            renderBoard();
        };

        const renderBoard = () => {
            boardElement.innerHTML = '';
            board.forEach((cell, index) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.innerText = cell;
                cellElement.addEventListener('click', () => handleCellClick(index));
                boardElement.appendChild(cellElement);
            });
        };

        const handleCellClick = (index) => {
            if (board[index] !== '' || !isGameActive) return;
            board[index] = currentPlayer;
            clickSound.play();
            renderBoard();
            checkResult();

            if (isComputerMode && isGameActive) {
                currentPlayer = player2Token;
                computerMove();
            } else {
                currentPlayer = currentPlayer === player1Token ? player2Token : player1Token;
            }
            renderBoard();
        };

        const computerMove = () => {
            let bestScore = -Infinity;
            let move;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = player2Token;
                    let score = minimax(board, 0, false);
                    board[i] = '';
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }

            board[move] = player2Token;
            checkResult();
            currentPlayer = player1Token; // Switch back to player 1
        };

        const minimax = (newBoard, depth, isMaximizing) => {
            const scores = {
                X: -1,
                O: 1,
                draw: 0
            };

            let result = checkWinner(newBoard);
            if (result !== null) {
                return scores[result];
            }

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < newBoard.length; i++) {
                    if (newBoard[i] === '') {
                        newBoard[i] = player2Token;
                        let score = minimax(newBoard, depth + 1, false);
                        newBoard[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < newBoard.length; i++) {
                    if (newBoard[i] === '') {
                        newBoard[i] = player1Token;
                        let score = minimax(newBoard, depth + 1, true);
                        newBoard[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        };

        const checkWinner = (board) => {
            for (let condition of winningConditions) {
                const [a, b, c] = condition;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return board[a]; // Return the winner token
                }
            }
            return board.includes('') ? null : 'draw'; // Return null if the game is still ongoing, otherwise return 'draw'
        };

        const checkResult = () => {
            let result = checkWinner(board);
            if (result) {
                isGameActive = false;
                if (result === 'draw') {
                    statusElement.innerText = "It's a draw!";
                    drawSound.play();
                } else {
                    statusElement.innerText = `${result === player1Token ? player1Name : player2Name} wins!`;
                    winSound.play();
                }
            }
        };

        resetButton.addEventListener('click', startGame);