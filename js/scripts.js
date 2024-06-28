"use strict";

const canva = document.getElementById("canvas");

const fallSpeed = 5;
const flySpeed = 12 * fallSpeed;
var spacePressed = false;
let startPlay = false;
let isLose = false;
let minBlockHeight = 20;
let maxBlockHeight = 70;
let blockWidth = 5;
if (window.innerWidth <= 600) {
  minBlockHeight = 20;
  maxBlockHeight = 50;
}
let blocks = [];
let token;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audio = document.getElementById("audio");
const pointDieAudio = document.getElementById("pointDieAudio");
const wingAudio = document.getElementsByTagName("source")[0];
const hiteAudio = document.getElementsByTagName("source")[1];
const dieAudio = document.getElementsByTagName("source")[2];
let update;
let createBlocks;
let score = 0;
let bestScore = 0;
let requestAnimationFrameId;

let xPosition = 0;
document.addEventListener("touchstart", letsPlay);
document.addEventListener("click", letsPlay);

window.addEventListener("resize", function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  if (width <= 600) {
    minBlockHeight = 20;
    maxBlockHeight = 50;
    blockWidth = 12;
  } else {
    minBlockHeight = 20;
    maxBlockHeight = 70;
    blockWidth = 5;
  }

  // code to execute using the new screen size
});

function letsPlay() {
  console.log("111111111111");
  if (startPlay == false) {
    console.log("okkkkk");
    startPlay = true;
    document.removeEventListener("touchstart", letsPlay);
    document.removeEventListener("click", letsPlay);
    update = setInterval(updateGame, 50);
    createBlocks = setInterval(createBlock, 3000);
    moveBackground();
  }
}

function moveBackground() {
  xPosition--;
  if (xPosition < -canva.offsetWidth) {
    xPosition = 0;
  }
  canva.style.backgroundPosition = `${xPosition}px 0`;
  requestAnimationFrameId = requestAnimationFrame(moveBackground);
}

function generateRandomToken() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function birdHight(sign, power) {
  const rect = bird.getBoundingClientRect();
  bird.style.top = rect.top + power * sign + "px";
}

function imgFly(src = "img/bird-up.png") {
  bird.src = src;
}

function fall() {
  const rect = bird.getBoundingClientRect();
  if (rect.y > window.innerHeight - rect.width - 0.08 * window.innerHeight) {
    console.log("detected ground ");
    stop();
  }
}

function createBlock() {
  let blockPosition;
  token = generateRandomToken();
  const randHeight = randInt(minBlockHeight, maxBlockHeight);
  blockPosition = randInt(0, 1)
    ? (blockPosition = "up")
    : (blockPosition = "bottom");

  // canva.innerHTML += `<div id=block-${token}><img class="block-head"><img  class="block-${blockPosition}" width="5%" height="${randHeight}%"></div>`;
  canva.innerHTML += `<div class="block-${blockPosition} block-img" id=block-${token}><div class="block-head-${blockPosition}"></div></div>`;
  let block = document.getElementById(`block-${token}`);
  block.style.width = blockWidth + "%";
  block.style.height = randHeight + "%";
  const block_info = {
    id: token,
    pass: false,
    position: blockPosition,
    width: 20,
    height: 400,
    obj: block,
  };
  blocks.push(block_info);
}

function detectCollision(birdRect, blockRect, className, block) {
  const playerLeft = birdRect.x;
  const playerRight = birdRect.x + birdRect.width;
  const blockLeft = blockRect.x;
  const blockRight = blockRect.x + blockRect.width;
  const playerBottom = birdRect.y + birdRect.height;
  const playerTop = birdRect.y;
  const upBlockTop = blockRect.y + blockRect.height;
  const bottomBlockTop = blockRect.y;
  let isDetect = false;

  if (className == "block-up block-img") {
    if (
      (blockLeft < playerRight &&
        playerLeft < blockLeft &&
        playerTop < upBlockTop) ||
      (playerRight > blockRight &&
        playerLeft < blockRight &&
        playerTop < upBlockTop) ||
      (playerRight < blockRight &&
        playerLeft > blockLeft &&
        playerTop < upBlockTop)
    ) {
      console.log("detected up ");
      isDetect = true;
      stop();
    }
  } else if (className == "block-bottom block-img") {
    if (
      (blockLeft < playerRight &&
        playerLeft < blockLeft &&
        playerBottom > bottomBlockTop) ||
      (playerRight > blockRight &&
        playerLeft < blockRight &&
        playerBottom > bottomBlockTop) ||
      (playerRight < blockRight &&
        playerLeft > blockLeft &&
        playerBottom > bottomBlockTop)
    ) {
      console.log("detected bottom");
      console.log(birdRect);
      isDetect = true;
      stop();
    }
  }
  if (playerLeft > blockRight && block.pass == false && isDetect == false) {
    score++;
    pointDieAudio.setAttribute("src", "sound/point.mp3");
    pointDieAudio.play();
    console.log("add score");
    let scoreText = document.getElementsByClassName("score-text")[0];
    scoreText.innerHTML = score;
    console.log(scoreText);
    block.pass = true;
  }
}

function updateBlocks() {
  blocks.forEach((block, index) => {
    try {
      const bk = document.getElementById(block.obj.id);
      const blockRect = bk.getBoundingClientRect();
      const birdRect = bird.getBoundingClientRect();

      //Move blocks
      moveBlock(bk);
      //End move blocks

      // Detect collision
      detectCollision(birdRect, blockRect, bk.className, block);
      // End detect collision

      // Remove passed blocks
      removeBlock(bk, blockRect, index);
      //End remove blocks
    } catch (e) {
      console.log(e);
    }
  });
}

function moveBlock(bk) {
  bk.style.right =
    (parseInt(bk.style.right) ? parseInt(bk.style.right) : 0) + 10 + "px";
}

function removeBlock(bk, blockRect, index) {
  if (blockRect.x <= 0) {
    blocks.splice(index, 1);
    bk.remove();
  }
}

function stop() {
  if (bestScore < score) bestScore = score;
  isLose = true;
  clearInterval(update);
  clearInterval(createBlocks);
  cancelAnimationFrame(requestAnimationFrameId);
  // menuBox.style.removeProperty("display");
  const menuBox = document.getElementById("menu-box");
  const scoreText = document.querySelector(".border p:nth-child(2)");
  const bestScoreText = document.querySelector(".border p:nth-child(4)");

  scoreText.innerHTML = score;
  bestScoreText.innerHTML = bestScore;
  menuBox.style.display = "flex";

  pointDieAudio.setAttribute("src", "sound/hit.mp3");
  pointDieAudio.play();
  audio.setAttribute("src", "sound/die.mp3");
  audio.play();

  const sheet = document.styleSheets[0]; // Replace 0 with the index of the stylesheet you want to modify
  const keyframes = sheet.cssRules[7]; // Replace 0 with the index of the keyframes rule you want to modify

  const birdRect = bird.getBoundingClientRect();
  const fallHeightPercent = birdRect.bottom + birdRect.y;
  const windowHeight = window.innerHeight;
  const a = windowHeight / 2 - birdRect.y - birdRect.width - 5;
  const birdElement = document.getElementById("bird");

  birdElement.style.removeProperty("top");
  birdElement.classList.add("bird-lose");

  keyframes.appendRule(
    "0% { transform: translate(0%, " + -1 * a + "px) rotate(0deg);",
    0
  );
}

function restart() {
  console.log("hiii");
  score = 0;
  xPosition = 0;
  spacePressed = false;
  isLose = false;
  blocks.forEach((e, index) => {
    const bk = document.getElementById(e.obj.id);
    // blocks.splice(index, 1);
    bk.remove();
  });
  let scoreText = document.getElementsByClassName("score-text")[0];
  scoreText.innerHTML = 0;
  console.log(blocks);
  blocks = [];

  const menuBox = document.getElementById("menu-box");
  const birdElement = document.getElementById("bird");

  birdElement.classList.remove("bird-lose");
  birdElement.classList.add("top");
  menuBox.style.display = "none";

  update = setInterval(updateGame, 50);
  createBlocks = setInterval(createBlock, 3000);
  moveBackground();
}

function fly() {
  audio.setAttribute("src", "sound/wing.mp3");
  bird.classList.remove("bird-smooth");
  birdHight(-1, flySpeed);
  imgFly("img/bird-down.png");
  setTimeout(imgFly, 150);
  audio.play();
}

document.addEventListener("click", () => {
  if (isLose === false && startPlay === true) fly();
});

document.addEventListener("touchstart", () => {
  if (isLose === false && startPlay === true) fly();
});

function checkBtn() {
  document.body.onkeyup = function (e) {
    if (e.code === "Space" && isLose === false && startPlay === true) {
      fly();
    }
  };

  bird.classList.add("bird-smooth");
}

// createBlock();

function updateGame() {
  birdHight(1, fallSpeed);
  checkBtn();
  fall();
  updateBlocks();
}

// const keyframes = document.styleSheets[0].cssRules[6];
// console.log(keyframes);
// keyframes.insertRule("100% { transform: translate(75%, 500%); }", 1);
// keyframes.deleteRule(2); // Delete the original 100% keyframe

// console.log(findInStylesheet(data));

// a = [{ a: "a" }, { b: "b" }, { c: "c" }];
