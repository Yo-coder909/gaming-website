let startTime;
        let timerInterval;
        let currentPuzzle;
        let solvedPuzzle;
        let currentDifficulty;
        let wrongEntries = 0; // Track number of wrong entries
        let score = 0; // Track score
        let timeLimit = 4 * 60 * 1000; // 4 minutes time limit
        let timerEndTimeout;
        let hintCount = 0; // Track the number of hints given
        let maxHints = 0; // Maximum number of hints based on difficulty

        // Sudoku helper functions
        const sudoku = (() => {
            function generateEmptyBoard() {
                return Array(9).fill().map(() => Array(9).fill('.'));
            }

            function isValid(board, row, col, num) {
                for (let x = 0; x < 9; x++) {
                    if (board[row][x] === num || board[x][col] === num) {
                        return false;
                    }
                }

                const startRow = Math.floor(row / 3) * 3;
                const startCol = Math.floor(col / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[startRow + i][startCol + j] === num) {
                            return false;
                        }
                    }
                }

                return true;
            }

            function solveSudoku(board) {
                for (let row = 0; row < 9; row++) {
                    for (let col = 0; col < 9; col++) {
                        if (board[row][col] === '.') {
                            for (let num = 1; num <= 9; num++) {
                                if (isValid(board, row, col, num.toString())) {
                                    board[row][col] = num.toString();
                                    if (solveSudoku(board)) {
                                        return true;
                                    }
                                    board[row][col] = '.';
                                }
                            }
                            return false;
                        }
                    }
                }
                return true;
            }

            function generateSolvedBoard() {
                const board = generateEmptyBoard();
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

                // Shuffle the numbers
                for (let i = numbers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                }

                // Fill the first row with the shuffled numbers
                for (let col = 0; col < 9; col++) {
                    board[0][col] = numbers[col].toString();
                }

                // Solve the board to generate a full, valid Sudoku
                if (!solveSudoku(board)) {
                    return generateSolvedBoard();
                }

                return board;
            }

            function removeNumbers(board, numbersToRemove) {
                const flattened = board.flat();
                const indices = Array.from({ length: 81 }, (_, i) => i);

                for (let i = 0; i < numbersToRemove; i++) {
                    const randomIndex = Math.floor(Math.random() * indices.length);
                    const cellIndex = indices.splice(randomIndex, 1)[0];
                    flattened[cellIndex] = '.';
                }

                return flattened;
            }

            function boardToString(board) {
                return board.flat().join('');
            }

            function stringToBoard(str) {
                return str.split('').map(char => char === '.' ? '.' : char);
            }

            return {
                generate: (difficulty) => {
                    const difficultyMap = { 'easy': 50, 'medium': 53, 'hard': 44 };
                    const numbersToKeep = difficultyMap[difficulty] || 53;
                    const solvedBoard = generateSolvedBoard();
                    const puzzleBoard = removeNumbers(solvedBoard, 81 - numbersToKeep);
                    return boardToString(puzzleBoard);
                },

                solve: (puzzleString) => {
                    const board = stringToBoard(puzzleString);
                    const reshaped = [];
                    for (let i = 0; i < 9; i++) {
                        reshaped.push(board.slice(i * 9, (i + 1) * 9));
                    }
                    if (solveSudoku(reshaped)) {
                        return boardToString(reshaped);
                    }
                    return null;
                }
            };
        })();

        // Timer functions
        function startTimer() {
            startTime = new Date();
            timerInterval = setInterval(updateTimer, 1000);

            // Set timer limit for 4 minutes
            timerEndTimeout = setTimeout(() => {
                stopTimer();
                alert("Game Over! Time limit exceeded.");
                $('#game-over-section').show();
            }, timeLimit);
        }

        function stopTimer() {
            clearInterval(timerInterval);
            clearTimeout(timerEndTimeout);
        }

        function updateTimer() {
            const currentTime = new Date();
            const elapsedTime = new Date(currentTime - startTime);
            const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
            const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
            $('#timer').text(`Time: ${minutes}:${seconds}`);
        }

        // Render Sudoku grid
        function renderGrid(puzzle) {
            const $grid = $('#grid');
            $grid.empty();

            for (let i = 0; i < 81; i++) {
                const value = puzzle[i] === '.' ? '' : puzzle[i];
                const $cell = $('<input>')
                    .addClass('sudoku-cell')
                    .attr({
                        type: 'text',
                        maxlength: '1',
                        readonly: value !== ''
                    })
                    .val(value);

                $grid.append($cell);
            }

            $('#game-container').show();
            $('#difficulty-container').hide();
            startTimer();
            $('#hint-btn').show(); // Show the hint button
        }

        // Validate Sudoku solution
        function validateSudoku() {
            $('.sudoku-cell').each(function (index) {
                const cellValue = $(this).val();
                const isCorrect = cellValue === solvedPuzzle[index];

                if (cellValue === '') {
                    $(this).removeClass('correct incorrect wrong-entry');
                } else if (isCorrect) {
                    $(this).removeClass('incorrect wrong-entry').addClass('correct');
                    score += 5; // Increase score for user's correct entry
                    $('#score').text(`Score: ${score}`);
                } else {
                    $(this).removeClass('correct wrong-entry').addClass('incorrect');
                    wrongEntries++; // Increment wrong entries count
                    $(this).addClass('wrong-entry'); // Apply red color for wrong entry
                }
            });

            // Check if wrong entries exceed 4
            if (wrongEntries > 4) {
                stopTimer();
                alert("Game Over! You have made too many wrong entries.");
                $('#game-over-section').show();
            }

            // If all cells are correct, show game over screen and fireworks
            if ($('.sudoku-cell.correct').length === 81) {
                stopTimer();
                showGameOver();
                showWinningAnimation();
            }
        }

        // Show winning animation (Fireworks)
        function showWinningAnimation() {
            const fireworks = new Fireworks();
            fireworks.start();
        }

        // Game over screen
        function showGameOver() {
            $('#game-over-section').show();
        }

        // Restart Game
        function restartGame() {
            stopTimer();
            wrongEntries = 0; // Reset wrong entries counter
            score = 0; // Reset score
            $('#score').text(`Score: ${score}`); // Update score display
            hintCount = 0; // Reset hints counter
            $('#hint-btn').show(); // Show hint button again

            const randomDifficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
            currentDifficulty = randomDifficulty;

            // Set max hints based on difficulty
            maxHints = randomDifficulty === 'easy' ? 2 : randomDifficulty === 'medium' ? 3 : 4;

            currentPuzzle = sudoku.generate(randomDifficulty);
            solvedPuzzle = sudoku.solve(currentPuzzle);
            renderGrid(currentPuzzle);
            $('#game-over-section').hide();
        }

        // Provide Hint
        function giveHint() {
            if (hintCount >= maxHints) {
                alert(`You have already used ${maxHints} hints.`);
                return;
            }

            let emptyCells = [];
            $('.sudoku-cell').each(function (index) {
                if (!$(this).val()) {
                    emptyCells.push(index);
                }
            });

            if (emptyCells.length > 0) {
                let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                let correctValue = solvedPuzzle[randomCell];
                $('.sudoku-cell').eq(randomCell).val(correctValue);
                hintCount++; // Increment hint count
                validateSudoku(); // Check if this cell's value is correct
            }
        }

        // Handle difficulty selection
        $(document).on('click', '.difficulty-btn', function () {
            const difficulty = $(this).data('difficulty');
            currentDifficulty = difficulty;

            // Set max hints based on difficulty
            maxHints = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

            currentPuzzle = sudoku.generate(difficulty);
            solvedPuzzle = sudoku.solve(currentPuzzle);
            renderGrid(currentPuzzle);
        });

        // Input validation
        $(document).on('input', '.sudoku-cell', function () {
            $(this).val($(this).val().replace(/[^1-9]/g, ''));
            validateSudoku();
        });

        // Restart game event
        $(document).on('click', '#restart-btn', function () {
            restartGame();
        });

        // Hint button event
        $(document).on('click', '#hint-btn', function () {
            giveHint();
        });