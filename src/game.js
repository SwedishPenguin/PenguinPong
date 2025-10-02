const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let playerScore = 0;
let aiScore = 0;
let isTwoPlayer = false;

const winningScore = 5;
const paddleWidth = 15;
const paddleHeight = 100;
const paddleSpeed = 8;

const modeMenu = document.getElementById('modeMenu');

const backgroundImage = new Image();
backgroundImage.src = "assets/Penguin-no-background.png";

const mainMenu = document.getElementById('mainMenu');
const gameWrapper = document.getElementById('gameWrapper');

const player = {
    x: 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const ai = {
    x: canvas.width - 30 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    dx: 5,
    dy: 3
};

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

backgroundImage.onload = () => {
    console.log("Background loaded!");
};

function movePlayer() {
    if (keys['w'] || keys['W']) {
        player.y -= paddleSpeed;
    }

    if (keys['s'] || keys['S']) {
        player.y += paddleSpeed;
    }
    
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawPaddle(paddle, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#00f7ff';
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawNet() {
    const netWidth = 4;
    const netHeight = 15;
    const gap = 20;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < canvas.height; i += netHeight + gap) {
        ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
  
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
    }
    
    if (ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height &&
        ball.dx < 0) {
        
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * 5;
        ball.dx = Math.abs(ball.dx) * 1.05;
    }
    
    if (ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height &&
        ball.dx > 0) {
        
        const hitPos = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        ball.dy = hitPos * 5;
        ball.dx = -Math.abs(ball.dx) * 1.05;
    }

    if (ball.x - ball.radius < 0) {
        aiScore++;
        updateScore();
        resetBall();
    }
   
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
    
    if (playerScore >= winningScore || aiScore >= winningScore) {
        endGame();
    }
}

function moveAI() {
    if (isTwoPlayer) {
        if (keys['ArrowUp']) {
            ai.y -= paddleSpeed;
        }
        if (keys['ArrowDown']) {
            ai.y += paddleSpeed;
        }
    } else {
        const aiCenter = ai.y + ai.height / 2;
        
        if (ball.dx > 0) {
            if (aiCenter < ball.y - 35) {
                ai.y += ai.speed;
            } else if (aiCenter > ball.y + 35) {
                ai.y -= ai.speed;
            }
        }
    }
    
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) {
        ai.y = canvas.height - ai.height;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

function updateScoreboardLabels() {
    const player1Label = document.getElementById('player1Label');
    const player2Label = document.getElementById('player2Label');
    
    if (isTwoPlayer) {
        player1Label.textContent = 'Player 1';
        player2Label.textContent = 'Player 2';
    } else {
        player1Label.textContent = 'You';
        player2Label.textContent = 'Opponent';
    }
}

function endGame() {
    gameRunning = false;
    const gameOverScreen = document.getElementById('gameOverScreen');
    const winnerText = document.getElementById('winnerText');
    const finalScore = document.getElementById('finalScore');
    
    if (isTwoPlayer) {
        if (playerScore >= winningScore) {
            winnerText.textContent = 'Player 1 Wins!';
        } else {
            winnerText.textContent = 'Player 2 Wins!';
        }
    } else {
        if (playerScore >= winningScore) {
            winnerText.textContent = 'You Win!';
        } else {
            winnerText.textContent = 'AI Wins!';
        }
    }
    
    finalScore.textContent = `Final Score: ${playerScore} - ${aiScore}`;
    gameOverScreen.classList.remove('hidden');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawPaddle(player, '#00f7ff');
    drawPaddle(ai, '#ff006e');
    drawBall();
}

function gameLoop() {
    if (gameRunning) {
        movePlayer(); 
        moveBall();
        moveAI();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    modeMenu.classList.remove('hidden');
});

document.getElementById('onePlayerBtn').addEventListener('click', () => {
    isTwoPlayer = false;
    startGame();
});

document.getElementById('twoPlayerBtn').addEventListener('click', () => {
    isTwoPlayer = true;
    startGame();
});

document.getElementById('backBtn').addEventListener('click', () => {
    modeMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

function startGame() {
    modeMenu.classList.add('hidden');
    gameWrapper.classList.remove('hidden');

    playerScore = 0;
    aiScore = 0;
    updateScore();
    updateScoreboardLabels();
    resetBall();
    gameRunning = true;
    gameLoop();
}

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    gameWrapper.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    playerScore = 0;
    aiScore = 0;
    updateScore();
});