// Set canvas width and height
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 380;
var interval = 0;
var score = 0;
var canJump = false;
var running = true;
var frame = 0;
var player = new Player(100, 304);
var gameObstacles = [];
var obstacles = [
    new Obstacle("assets/spikeC.png", 815, 360, 149, 299, 6),
    new Obstacle("assets/spikeB.png", 815, 360, 184, 195, 6),
    new Obstacle("assets/spikeD.png", 815, 280, 326, 159, 6),
    new Obstacle("assets/spikeA.png", 815, 360, 270, 258, 6)
];
var ground = new Obstacle("assets/base.png", 0, 360, 800, 100);
var background = new Background("assets/layer2.png", 0, 0, 3);
var myscore = new Score(670, 35);

function clearCanvas() {
    "use strict";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function disableJump() {
    canJump = false;
}

function enableJump() {
    canJump = true;
}

function jump(e) {
    if (32 === e.keyCode && canJump) {
        e.preventDefault();
        //here add the code to jump
        disableJump();
        var jumpInt = setInterval(function () {
            player.posY -= 10;
            player.anim = player.jumpAnim;
            if (player.posY <= 150) {
                clearInterval(jumpInt);
                window.removeEventListener("keydown", jump, false);
                land(e);
                return;
            }
        }, 16);
    }
}

function land(e) {
    if (32 === e.keyCode) {
        //here add the code to land
        enableJump();
        var landInt = setInterval(function () {
            player.posY += 10;
            player.anim = player.landAnim;
            if (player.posY >= 304) {
                clearInterval(landInt);
                window.addEventListener("keydown", jump, false);
                window.removeEventListener("keyup", enableJump, false);
                player.anim = player.runAnim;
                return;
            }
        }, 16);
    }
}

function getRandomDist() {
    var min = 300;
    var max = 500;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pushRandomObstacle() {
    var obstacleIndex = Math.floor(Math.random() * obstacles.length);
    //copy objects from obstacles to gameObstacles with jQuery
    var clonedObstacle = $.extend(false, {}, obstacles[obstacleIndex]);
    gameObstacles.push(clonedObstacle);
  }

  function removeFirstObstacle() {
    if (gameObstacles[0].x < -100) {
      gameObstacles.splice(0, 1);
    }
  }

  function manageGameObstaclesArray() {
    var dist = getRandomDist();
    if (gameObstacles[gameObstacles.length - 1].x < dist) {
      pushRandomObstacle();
    }
    removeFirstObstacle();
  }

  function updateObstacles() {
    for (var i = 0; i < gameObstacles.length; i += 1) {
      gameObstacles[i].drawObstacle();
      gameObstacles[i].moveObstacle();
    }
  }

  function detectCollision() {
    for (i = 0; i < gameObstacles.length; i += 1) {
      if (!player.crashed(gameObstacles[i])) {
        stop();
      }
    }
  }

function stop() {
    "use strict";
    running = false;
    if (interval) {
        window.cancelAnimationFrame(interval);
        interval = 0;
    }
    document.getElementById("cover").style.display = "block";
    document.getElementById("over").style.display = "block";
    document.getElementById("restart").style.display = "block";
    window.removeEventListener("keydown", jump, false);
    window.removeEventListener("keyup", disableJump, false);
    enableJump();
}

function updateFrame() {
    interval = window.requestAnimationFrame(updateFrame);
    if (running) {
        clearCanvas();
        frame += 1;
        background.drawBackground();
        myscore.drawScore();
        myscore.updateScore();
        player.drawPlayer();
        manageGameObstaclesArray();
        updateObstacles();
        ground.drawGround();
        if (frame > 0 && frame < 100) {
            document.getElementById("warning").style.display = "block";
        }
        else {
            document.getElementById("warning").style.display = "none";
        }
        detectCollision();
    }
}

function start() {
    running = true;
    pushRandomObstacle();
    window.addEventListener("keydown", jump, false);
    window.addEventListener("keyup", enableJump, false);
    document.getElementById("over").style.display = "none";
    canJump = true;
    updateFrame();
}