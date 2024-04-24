const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const maxCanvasWidth = 800; // Maximum width of the canvas
const maxCanvasHeight = 600; // Maximum height of the canvas
let canvasSize = calculateCanvasSize();

// Set canvas size
canvas.width = canvasSize.width;
canvas.height = canvasSize.height;
canvas.style.display = 'block';
canvas.style.margin = 'auto'; // Center the canvas

// Recalculate canvas size on window resize
window.addEventListener('resize', () => {
    canvasSize = calculateCanvasSize();
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
});

// Ensure canvas has focus for keyboard input
canvas.setAttribute('tabindex', '0');
canvas.focus();

function calculateCanvasSize() {
    const aspectRatio = maxCanvasWidth / maxCanvasHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth / screenHeight > aspectRatio) {
        // Fit to height
        return {
            width: screenHeight * aspectRatio,
            height: screenHeight
        };
    } else {
        // Fit to width
        return {
            width: screenWidth,
            height: screenWidth / aspectRatio
        };
    }
}

const paddleWidth = 18,
    paddleHeight = 120,
    paddleSpeed = 8,
    ballRadius = 30, // Increased ball radius
    initialBallSpeed = 5,
    maxBallSpeed = 40,
    netWidth = 5,
    netColor = "white";

let user = { x: 0, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: "white", score: 0 };
let com = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: "white", score: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: ballRadius, velocityX: initialBallSpeed, velocityY: initialBallSpeed, color: "red", speed: initialBallSpeed };

// Tail effect for the ball
let trail = [];

// Keyboard event listeners
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Initialize keys object to track which keys are pressed
const keys = {
    w: false,
    s: false
};

// Key down event handler
function keyDownHandler(event) {
    if (event.key === 'w') {
        keys.w = true;
    } else if (event.key === 's') {
        keys.s = true;
    }
}

// Key up event handler
function keyUpHandler(event) {
    if (event.key === 'w') {
        keys.w = false;
    } else if (event.key === 's') {
        keys.s = false;
    }
}

function update() {
    // Move user paddle
    if (keys.w && user.y > 0) {
        user.y -= paddleSpeed;
    }
    if (keys.s && user.y < canvas.height - user.height) {
        user.y += paddleSpeed;
    }

    // Rest of the update function...
}

// Difficulty levels
const difficultyLevels = [
    { name: "Easy", comSpeed: 0.01 }, // Slow reaction time
    { name: "Medium", comSpeed: 0.03 }, // Medium reaction time
    { name: "Hard", comSpeed: 0.05 } // Fast reaction time
];

// Set initial difficulty level
let currentDifficulty = difficultyLevels[1]; // Medium

function changeDifficulty(difficulty) {
    currentDifficulty = difficultyLevels.find(level => level.name === difficulty);
}

// Power-up variables
let powerUpActive = false;
let powerUpDuration = 5000; // 5 seconds
let powerUpStart = 0;

// Power-up types
const powerUpTypes = [
    { name: "EnlargePaddle", color: "blue" } // Increase paddle size
];

// Active power-up properties
let activePowerUp = null;
let userScoreForPowerUp = 0; // Track user score for power-up activation

function activatePowerUp(powerUp) {
    powerUpActive = true;
    powerUpStart = Date.now();
    activePowerUp = powerUp;
    
    // Apply power-up effect
    switch (powerUp.name) {
        case "EnlargePaddle":
            // Check if the user's paddle is not already enlarged
            if (user.height === paddleHeight) {
                user.height *= 2; // Double the paddle height
            }
            break;
        // Add more power-up effects as needed
    }
}

function deactivatePowerUp() {
    powerUpActive = false;
    activePowerUp = null;
    
    // Reset power-up effects
    user.height = paddleHeight; // Reset paddle height
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
    }
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color, borderColor) {
    // Draw the glow
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    // Draw the border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
}

function drawText(text, x, y, color, fontSize = 60, fontWeight = 'bold', font = "Courier New") {
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${fontSize}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function collision(b, p) {
    return (
        b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && b.y + b.radius > p.y && b.y - b.radius < p.y + p.height
    );
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.velocityX = -ball.velocityX;
    ball.speed = initialBallSpeed;
    trail = []; // Reset the tail trail
}

function update() {
    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
        userScoreForPowerUp++; // Increment user score for power-up activation
        if (userScoreForPowerUp === 3) {
            // Activate power-up after scoring three times
            userScoreForPowerUp = 0; // Reset score counter
            const randomPowerUp = generateRandomPowerUp();
            activatePowerUp(randomPowerUp);
        }
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Add position to the tail trail
    trail.push({ x: ball.x, y: ball.y });

    if (trail.length > 7) {
        trail.shift(); // Remove the oldest position to maintain the tail length
    }

    com.y += (ball.y - (com.y + com.height / 2)) * currentDifficulty.comSpeed; // Adjust com speed based on difficulty

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Check if power-up is active and its duration has passed
    if (powerUpActive && Date.now() - powerUpStart > powerUpDuration) {
        deactivatePowerUp();
    }

    let player = ball.x + ball.radius < canvas.width / 2 ? user : com;
    if (collision(ball, player)) {
        const collidePoint = ball.y - (player.y + player.height / 2);
        const collisionAngle = (Math.PI / 4) * (collidePoint / (player.height / 2));
        const direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(collisionAngle);
        ball.velocityY = ball.speed * Math.sin(collisionAngle);

        ball.speed += 0.2;
        if (ball.speed > maxBallSpeed) {
            ball.speed = maxBallSpeed;
        }
    }
}

function render() {
    drawRect(0, 0, canvas.width, canvas.height, "black"); // Draw black background

    // Draw the tail trail
    for (let i = 0; i < trail.length; i++) {
        const alpha = i / trail.length;
        const trailColor = `rgba(255, 0, 0, ${alpha})`;
        drawCircle(trail[i].x, trail[i].y, ball.radius * 1.2, trailColor, trailColor); // Adjusted ball radius for the tail
    }

    // Draw the ball
    drawCircle(ball.x, ball.y, ball.radius, "red", "white");

    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);

    // Draw active power-up indicator
    if (powerUpActive) {
        drawText(activePowerUp.name, canvas.width / 2, 50, activePowerUp.color, 30, 'bold');
    }

    requestAnimationFrame(gameLoop);
}

// Function to generate a random power-up
function generateRandomPowerUp() {
    const randomIndex = Math.floor(Math.random() * powerUpTypes.length);
    return powerUpTypes[randomIndex];
}

function gameLoop() {
    update();
    render();
}

gameLoop();
