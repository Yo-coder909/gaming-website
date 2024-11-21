// Game Constants and State
const gridSize = 7;
let playerPos = { x: 0, y: 0 };
let endPos = { x: gridSize - 1, y: gridSize - 1 };
let obstacles = [];
let movingObstacles = [];
let movingObstaclesDirection = [];
let visitedCells = new Set();
let stepsTaken = 0;
let remainingMoves = 30;
let lives = 3;
let gameOver = false;

const gridElement = document.getElementById('grid');
const stepsElement = document.getElementById('steps');
const remainingMovesElement = document.getElementById('remainingMoves');
const livesElement = document.getElementById('lives');
let messageElement = document.getElementById('message');
const difficultySettings = {
  Easy: { obstacleCount: 5, movingObstacleCount: 2 },
  Medium: { obstacleCount: 10, movingObstacleCount: 4 },
  Hard: { obstacleCount: 15, movingObstacleCount: 6 }
};
let difficulty = 'Easy'; // Default difficulty

// Update heart display for lives
function updateLivesDisplay() {
  livesElement.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement('span');
    heart.classList.add('heart');
    heart.textContent = '❤️';
    livesElement.appendChild(heart);
  }
}

// Show How to Play Modal
function showHowToPlay() {
  document.getElementById('how-to-play-modal').style.display = 'flex';
}

// Close How to Play Modal
function closeHowToPlay() {
  document.getElementById('how-to-play-modal').style.display = 'none';
}

// Start Game
function startGame(level) {
  difficulty = level;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-info').style.display = 'block';
  updateLivesDisplay();
  createGrid();
}

// Reset game state
function resetGame() {
  playerPos = { x: 0, y: 0 };
  endPos = { x: gridSize - 1, y: gridSize - 1 };
  obstacles = [];
  movingObstacles = [];
  movingObstaclesDirection = [];
  visitedCells.clear();
  stepsTaken = 0;
  remainingMoves = 30;
  lives = 3;
  gameOver = false;

  // Update UI
  stepsElement.textContent = stepsTaken;
  remainingMovesElement.textContent = remainingMoves;
  updateLivesDisplay();
  messageElement.textContent = "Use arrow keys to move!";
  document.getElementById('restart-container').classList.add('hidden');
}

// Create the grid
function createGrid() {
  gridElement.innerHTML = ''; // Clear grid
  visitedCells.clear();

  // Ensure moving obstacles are in the 3x3 area around the endpoint
  for (let y = endPos.y - 1; y <= endPos.y + 1; y++) {
    for (let x = endPos.x - 1; x <= endPos.x + 1; x++) {
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        movingObstacles.push({ x, y });
        movingObstaclesDirection.push(Math.random() > 0.5 ? 'left' : 'right');
      }
    }
  }

  // Randomize static obstacles outside of the 3x3 area
  for (let i = 0; i < difficultySettings[difficulty].obstacleCount; i++) {
    let pos;
    do {
      pos = getRandomPosition();
    } while (
      (pos.x === endPos.x && pos.y === endPos.y) || // Ensure obstacles don't overlap endpoint
      (pos.x >= endPos.x - 1 && pos.x <= endPos.x + 1 && pos.y >= endPos.y - 1 && pos.y <= endPos.y + 1) // Ensure obstacles are outside the 3x3 region around endpoint
    );
    obstacles.push(pos);
  }

  // Render the grid
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      gridElement.appendChild(cell);
    }
  }

  // Set up initial positions (player, endpoint)
  updatePlayer();
  markEndPoint();
  markObstacles();
  markMovingObstacles();
  
  // Show the grid
  gridElement.classList.add('show');
}

// Get random position
function getRandomPosition() {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  return { x, y };
}

// Check if the position is occupied
function isOccupied(x, y) {
  return (
    (x === playerPos.x && y === playerPos.y) || // Player position
    obstacles.some(o => o.x === x && o.y === y) || // Static obstacles
    movingObstacles.some(m => m.x === x && m.y === y) // Moving obstacles
  );
}

// Update player position on the grid
function updatePlayer() {
  const cells = gridElement.querySelectorAll('.cell');
  const index = playerPos.y * gridSize + playerPos.x;
  cells.forEach(cell => cell.classList.remove('player')); // Clear old player position
  cells[index].classList.add('player');
}

// Mark endpoint on the grid
function markEndPoint() {
  const cells = gridElement.querySelectorAll('.cell');
  const index = endPos.y * gridSize + endPos.x;
  cells[index].classList.add('end');
}

// Mark obstacles
function markObstacles() {
  const cells = gridElement.querySelectorAll('.cell');
  obstacles.forEach(o => {
    const index = o.y * gridSize + o.x;
    cells[index].classList.add('obstacle');
  });
}

// Mark moving obstacles
function markMovingObstacles() {
  const cells = gridElement.querySelectorAll('.cell');
  movingObstacles.forEach(m => {
    const index = m.y * gridSize + m.x;
    cells[index].classList.add('obstacle');
  });
}

// Move obstacles
function moveObstacles() {
  if (gameOver) return;

  const cells = gridElement.querySelectorAll('.cell');
  movingObstacles.forEach((m, index) => {
    const currentIndex = m.y * gridSize + m.x;
    cells[currentIndex].classList.remove('obstacle'); // Remove from old position

    // Move obstacle horizontally
    if (movingObstaclesDirection[index] === 'left') {
      m.x = Math.max(0, m.x - 1);
    } else {
      m.x = Math.min(gridSize - 1, m.x + 1);
    }

    // Check for collision with player
    if (m.x === playerPos.x && m.y === playerPos.y) {
      lives--;
      updateLivesDisplay(); // Update heart display when player hits obstacle
      if (lives === 0) {
        gameOver = true;
        messageElement.textContent = 'Game Over!';
        document.getElementById('restart-container').classList.remove('hidden');
      } else {
        messageElement.textContent = `You hit an obstacle! Lives remaining: ${lives}`;
      }
    }

    // Change direction if obstacle hits grid boundary
    if (m.x === 0 || m.x === gridSize - 1) {
      movingObstaclesDirection[index] = movingObstaclesDirection[index] === 'left' ? 'right' : 'left';
    }

    // Update obstacle position
    const newIndex = m.y * gridSize + m.x;
    cells[newIndex].classList.add('obstacle');
  });
}

// Handle player movement
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  let newPlayerPos = { ...playerPos };

  if (e.key === 'ArrowUp') newPlayerPos.y--;
  if (e.key === 'ArrowDown') newPlayerPos.y++;
  if (e.key === 'ArrowLeft') newPlayerPos.x--;
  if (e.key === 'ArrowRight') newPlayerPos.x++;

  // Check boundaries
  if (newPlayerPos.x < 0 || newPlayerPos.x >= gridSize || newPlayerPos.y < 0 || newPlayerPos.y >= gridSize) {
    return;
  }

  // Check if player hits an obstacle
  if (isOccupied(newPlayerPos.x, newPlayerPos.y)) {
    lives--;
    updateLivesDisplay(); // Update heart display when player hits obstacle
    if (lives === 0) {
      gameOver = true;
      messageElement.textContent = 'Game Over!';
      document.getElementById('restart-container').classList.remove('hidden');
    } else {
      messageElement.textContent = `You hit an obstacle! Lives remaining: ${lives}`;
    }
    return;
  }

  // Update player position
  playerPos = newPlayerPos;
  stepsTaken++;
  stepsElement.textContent = stepsTaken;

  // Update grid
  updatePlayer();
  remainingMoves--;
  remainingMovesElement.textContent = remainingMoves;

  // Check if player reached endpoint
  if (playerPos.x === endPos.x && playerPos.y === endPos.y) {
    messageElement.textContent = 'You reached the endpoint! Well done!';
    gameOver = true;
    document.getElementById('restart-container').classList.remove('hidden');
  }
});

// Restart the game
function restartGame() {
  resetGame();
  createGrid();
}

// Game loop for moving obstacles
setInterval(moveObstacles, 500); // Move obstacles every 500ms
