const cardCharacters = {
    easy: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'],
    medium: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'],
    hard: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H']
};

let board = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;
let timerInterval;
let elapsedTime = 0;
let lives = 4;

function startGame() {
    const difficulty = document.getElementById('difficulty').value;
    board = shuffle(cardCharacters[difficulty]);
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    matchesFound = 0;
    elapsedTime = 0;
    lives = 4;
    document.getElementById('status').innerText = '';
    document.getElementById('timer').innerText = 'Time: 0s';
    document.getElementById('lives').innerText = 'Lives: ❤️❤️❤️❤️';
    document.getElementById('celebration').style.display = 'none';
    document.getElementById('time-up').style.display = 'none';
    document.getElementById('retry').style.display = 'none';

    board.forEach(value => {
        const card = createCard(value);
        gameBoard.appendChild(card);
    });

    adjustGrid(difficulty);
    startTimer(difficulty);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function adjustGrid(difficulty) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = 'repeat(4, 100px)'; // Always keep 4 blocks in a row
}

function createCard(character) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = character;

    const frontFace = document.createElement('div');
    frontFace.classList.add('front');

    const backFace = document.createElement('div');
    backFace.classList.add('back');
    backFace.textContent = character;

    card.appendChild(frontFace);
    card.appendChild(backFace);
    card.addEventListener('click', flipCard);
    return card;
}

function flipCard() {
    if (lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        lockBoard = true;
        checkMatch();
    }
}

function checkMatch() {
    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchesFound++;
        showPrompt('Match found!');
        if (matchesFound === (board.length / 2)) {
            clearInterval(timerInterval); // Stop the timer
            showCelebration();
        }
        resetBoard();
    } else {
        lives--;
        document.getElementById('lives').innerText = 'Lives: ' + '❤️'.repeat(lives);
        showPrompt('Try again!');

        if (lives === 0) {
            clearInterval(timerInterval); // Stop the timer
            document.getElementById('status').innerText = 'Game Over! Try Again!';
            showGameOverPrompt();
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000);
        }
    }
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function startTimer(difficulty) {
    const timeLimit = {
        easy: 60,
        medium: 120,
        hard: 180
    }[difficulty];

    timerInterval = setInterval(() => {
        elapsedTime++;
        document.getElementById('timer').innerText = 'Time: ' + elapsedTime + 's';

        if (elapsedTime >= timeLimit) {
            clearInterval(timerInterval);
            document.getElementById('status').innerText = 'Time is up! Try again.';
            showTimeUpAnimation();
        }
    }, 1000);
}

function showPrompt(message) {
    const statusElement = document.getElementById('status');
    statusElement.innerText = message;
    statusElement.style.animation = 'shake 0.5s';
    setTimeout(() => {
        statusElement.style.animation = '';
    }, 500);
}

function showCelebration() {
    const celebrationElement = document.getElementById('celebration');
    celebrationElement.style.display = 'block';
    celebrationElement.style.animation = 'winAnimation 1s forwards';

    createConfetti();
    createPartyPoppers();

    setTimeout(() => {
        celebrationElement.style.display = 'none';
    }, 30000); // Show celebration for 30 seconds
}

function showTimeUpAnimation() {
    const timeUpElement = document.getElementById('time-up');
    timeUpElement.style.display = 'block';
    setTimeout(() => {
        timeUpElement.style.display = 'none';
    }, 3000);
    showGameOverPrompt(); // Prompt for retry after time is up
}

function resetGame() {
    setTimeout(() => {
        startGame(); // Restart the game after a delay
    }, 3000);
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        document.body.appendChild(confetti);
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

function createPartyPoppers() {
    for (let i = 0; i < 30; i++) {
        const popper = document.createElement('div');
        popper.classList.add('popper');
        popper.style.left = Math.random() * 100 + 'vw';
        popper.style.bottom = '0';
        document.body.appendChild(popper);
        setTimeout(() => {
            popper.remove();
        }, 500);
    }
}

function showGameOverPrompt() {
    const retryElement = document.getElementById('retry');
    retryElement.innerText = 'Would you like to play again? (Click "Restart Game")';
    retryElement.style.display = 'block';
}

window.onload = startGame;