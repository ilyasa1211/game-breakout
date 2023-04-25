const BLOCK_COUNT = 50;
const FRAMES_PER_SECOND = 60;

var body = document.body;
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");

canvas.height = innerHeight;
canvas.width = innerWidth;
canvas.style.backgroundColor = "rgb(46,46,46)";

body.appendChild(canvas);

const PLATFORM = {
  width: 0.2 * canvas.width,
  height: 0.03 * canvas.height,
  initialXPosition: canvas.width / 2 - (0.2 * canvas.width) / 2,
  initialYPosition: canvas.height - 2 * (0.03 * canvas.height),
  centerPlatform: canvas.width / 2,
};

var xVelocity = 1;
var yVelocity = 1;
var xAccelerator = 0;
var yAccelerator = 10;
var gameOver = false;
var score = 0;
var message = "";
var pause = true;
var blocks = Array(BLOCK_COUNT).fill(1);

setInterval(function () {
  if (window.isWin()) {
    clearCanvas();
    insertMessage("You Win! Score: " + score);
    return;
  }
  if (window.gameOver) {
    clearCanvas();
    insertMessage("You Lose!\nScore: " + score + "\nClick To Play Again!");
    return;
  }
  if (window.pause) {
    clearCanvas();
    insertMessage("Paused! Click Anywhere To Play");
    return;
  }
  clearCanvas();
  let ballXposition = xVelocity + canvas.width / 2;
  let ballYposition = yVelocity + canvas.height / 2;
  let ballRadius = 0.015 * canvas.height;
  blocks.forEach((block, index) => {
    let blockWidth = 0.08 * canvas.width;
    let blockHeight = 0.05 * canvas.height;
    let blockXPosition = (index % 10) * 0.1 * canvas.width;
    let blockYPosition = Math.floor(index / 10) * 0.08 * canvas.height;
    let touchBlockX =
      ballXposition > blockXPosition &&
      ballXposition < blockXPosition + blockWidth;
    let touchBlockY =
      ballYposition > blockYPosition &&
      ballYposition < blockYPosition + blockHeight;
    let touchBlock = touchBlockX && touchBlockY;
    if (block && touchBlock) {
      yAccelerator = -yAccelerator;
      score += 10;
      blocks[index] = 0;
    }
    context.beginPath();
    context.rect(blockXPosition, blockYPosition, blockWidth, blockHeight);
    context.fillStyle = block ? `rgb(255, 255, 130)` : "transparent";
    context.fill();
  });
  context.beginPath();
  context.arc(ballXposition, ballYposition, ballRadius, 0, Math.PI * 2);
  context.fillStyle = "#ffaa00";
  context.fill();
  let touchXBorder =
    ballXposition > canvas.width - ballRadius / 2 ||
    ballXposition < 0 + ballRadius / 2;
  let touchYBorder = ballYposition < 0 + ballRadius / 2;
  let touchVoid = ballYposition > canvas.height - ballRadius / 2;
  let touchPlatform =
    ballYposition > PLATFORM.initialYPosition - ballRadius / 2 &&
    ballYposition <
      PLATFORM.initialYPosition + PLATFORM.height - ballRadius / 2 &&
    ballXposition > PLATFORM.initialXPosition - ballRadius / 2 &&
    ballXposition < PLATFORM.initialXPosition + PLATFORM.width - ballRadius / 2;
  ballXposition < PLATFORM.width;
  if (touchXBorder) xAccelerator = -xAccelerator;
  if (touchVoid) {
    window.gameOver = true;
  }
  if (touchYBorder || touchPlatform) {
    if (touchPlatform)
      xAccelerator = (PLATFORM.centerPlatform - ballXposition) / -10;
    yAccelerator = -yAccelerator;
  }
  xVelocity += xAccelerator;
  yVelocity += yAccelerator;
  context.beginPath();
  context.rect(
    PLATFORM.initialXPosition,
    PLATFORM.initialYPosition,
    PLATFORM.width,
    PLATFORM.height
  );
  context.fillStyle = "white";
  context.fill();
}, 1000 / FRAMES_PER_SECOND);

canvas.onmousedown = () => {
  window.pause = false;
  window.gameOver && setToInitialValue();
  canvas.onmousemove = (e) => {
    PLATFORM.initialXPosition = e.clientX - PLATFORM.width / 2;
    PLATFORM.centerPlatform = e.clientX;
  };
};

canvas.onmouseleave = () => {
  window.pause = true;
};
function insertMessage(message, posY = canvas.height / 2) {
  const messages = message.split("\n");
  context.font = "50px Arial";
  context.fillStyle = "white";
  let prevTextHeight = 0;
  let marginBlock = 50;
  messages.forEach((msg, index) => {
    textPosition = context.measureText(msg);
    prevTextHeight =
      posY -
      textPosition.actualBoundingBoxAscent * messages.length +
      textPosition.actualBoundingBoxAscent * index +
      marginBlock * index;
    context.fillText(
      msg,
      canvas.width / 2 - textPosition.width / 2,
      prevTextHeight
    );
  });
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function isWin() {
  let condition = !blocks.find((_) => _ === 1);
  if (condition) window.gameOver = true;
  return condition;
}

function setToInitialValue() {
  window.platform = {
    width: 0.2 * canvas.width,
    height: 0.03 * canvas.height,
    initialXPosition: canvas.width / 2 - (0.2 * canvas.width) / 2,
    initialYPosition: canvas.height - 2 * (0.03 * canvas.height),
    centerPlatform: canvas.width / 2,
  };
  window.xVelocity = 1;
  window.yVelocity = 1;
  window.xAccelerator = 0;
  window.yAccelerator = 10;
  window.score = 0;
  window.message = "";
  window.blocks = Array(BLOCK_COUNT).fill(1);
  window.pause = false;
  window.gameOver = false;
}
