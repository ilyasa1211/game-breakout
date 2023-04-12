const BLOCK_COUNT = 50;
const FRAME_PER_SECOND = 60;

var canvas = document.createElement("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
canvas.style.backgroundColor = "rgb(46,46,46)";
var context = canvas.getContext("2d");

var body = document.body;
body.appendChild(canvas);

const platform = {
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
    retry();
    return;
  }
  if (window.gameOver) {
    clearCanvas();
    insertMessage("You Lose! Score: " + score);
    retry();
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
  blocks.forEach((arr, index) => {
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
    if (arr && touchBlock) {
      yAccelerator = -yAccelerator;
      score += 10;
      blocks[index] = 0;
    }
    context.beginPath();
    context.rect(blockXPosition, blockYPosition, blockWidth, blockHeight);
    context.fillStyle = arr ? `rgb(255, 255, 130)` : "transparent";
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
    ballYposition > platform.initialYPosition - ballRadius / 2 &&
    ballYposition <
      platform.initialYPosition + platform.height - ballRadius / 2 &&
    ballXposition > platform.initialXPosition - ballRadius / 2 &&
    ballXposition < platform.initialXPosition + platform.width - ballRadius / 2;
  ballXposition < platform.width;
  if (touchXBorder) xAccelerator = -xAccelerator;
  if (touchVoid) {
    window.gameOver = true;
  }
  if (touchYBorder || touchPlatform) {
    if (touchPlatform)
      xAccelerator = (platform.centerPlatform - ballXposition) / -10;
    yAccelerator = -yAccelerator;
  }
  xVelocity += xAccelerator;
  yVelocity += yAccelerator;
  context.beginPath();
  context.rect(
    platform.initialXPosition,
    platform.initialYPosition,
    platform.width,
    platform.height
  );
  context.fillStyle = "white";
  context.fill();
}, 1000 / FRAME_PER_SECOND);
canvas.onmousedown = () => {
  window.pause = false;
  canvas.onmousemove = (e) => {
    platform.initialXPosition = e.clientX - platform.width / 2;
    platform.centerPlatform = e.clientX;
  };
};
canvas.onmouseleave = () => {
  window.pause = true;
};
function insertMessage(message, posY = canvas.height / 2) {
  window.message = message;
  context.font = "50px Arial";
  textPosition = context.measureText(message).width;
  context.fillStyle = "white";
  context.fillText(message, canvas.width / 2 - textPosition / 2, posY);
}
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}
function isWin() {
  let condition = !blocks.find((_) => _ === 1);
  if (condition) window.gameOver = true;
  return condition;
}
function retry() {
  canvas.onclick = () => location.reload();
}