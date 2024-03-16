{
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  /** @type {HTMLCanvasElement} */
  const cacheCanvas = document.querySelector("#cacheCanvas");
  const cacheCtx = cacheCanvas.getContext("2d");

  const mouse = { x: 0, y: 0 };
  const hole = { x: 0, y: 0, radius: 18, ballIn: false, animationTime: 2.5 };
  const ball = new Ball(mouse);

  let currentLevel = 0;
  let levelData = levels[currentLevel];

  let started = false;
  let timer = 30;
  let lastTime = performance.now();
  let perSecondTime = 0;

  function initLevel() {
    const levelData = levels[currentLevel];

    canvas.width = levelData.size.width;
    canvas.height = levelData.size.height;

    cacheCanvas.width = levelData.size.width;
    cacheCanvas.height = levelData.size.height;

    ball.x = levelData.start.x;
    ball.y = levelData.start.y;

    hole.x = levelData.end.x;
    hole.y = levelData.end.y;
  }

  // Update Functions
  function updateTimer() {
    if (!started || ball.holeIn) {
      return;
    }

    if (timer <= 0) {
      timer = 0;
      return;
    }

    timer--;
  }

  // Util Functions
  function checkHoleCollision() {
    const distance = Math.sqrt((hole.x - ball.x) ** 2 + (hole.y - ball.y) ** 2);

    if (distance <= ball.radius + 2 && ball.energy < 0.83) {
      triggerHoleIn();
    }
  }

  function triggerHoleIn() {
    ball.holeIn = true;
    hole.ballIn = true;

    ball.energy = 0;
    ball.x = hole.x;
    ball.y = hole.y;
  }

  // Draw Functions
  function drawHole(deltaTime) {
    ctx.save();

    ctx.fillStyle = "black";
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 14;

    ctx.beginPath();

    if (!hole.ballIn) {
      ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI, false);
    } else {
      if (hole.animationTime <= 0) {
        hole.animationTime = 0;
        return;
      }

      if (hole.animationTime <= 1) {
        const radius = hole.radius * hole.animationTime;
        ctx.arc(hole.x, hole.y, radius, 0, 2 * Math.PI, false);
      } else {
        ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI, false);
      }

      hole.animationTime -= 0.1;
    }

    ctx.fill();

    ctx.restore();
  }

  function drawTimer() {
    ctx.save();

    ctx.textAlign = "center";
    if (!ball.holeIn) {
      ctx.font = "14px Poppins";
    } else {
      ctx.font = `${14 * ball.animationTime}px Poppins`;
    }
    ctx.fillText(timer, ball.x, ball.y + 5);

    ctx.restore();
  }

  function drawMap() {
    ctx.drawImage(cacheCanvas, 0, 0);
  }

  function cacheMap() {
    cacheCtx.clearRect(0, 0, levelData.size.width, levelData.size.height);

    cacheCtx.fillStyle = "rgb(1, 57, 9)";
    cacheCtx.beginPath();

    const p1 = levelData.walls[0];
    cacheCtx.moveTo(p1.x, p1.y);

    for (let index = 1; index < levelData.walls.length; index++) {
      const p2 = levelData.walls[index];

      cacheCtx.lineTo(p2.x, p2.y);
    }

    const firstPoint = levelData.walls[0];
    const lastPoint = levelData.walls[levelData.walls.length - 1];
    if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
      cacheCtx.lineTo(firstPoint.x, firstPoint.y);
    }

    cacheCtx.fill();
  }

  // Events
  document.addEventListener("mousemove", function (event) {
    if (activePageKey !== "game") {
      return;
    }

    const canvasBoundingRect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - canvasBoundingRect.left;
    mouse.y = event.clientY - canvasBoundingRect.top;
  });

  document.addEventListener("mousedown", function (event) {
    if (activePageKey !== "game") {
      return;
    }

    ball.startAiming();
  });

  document.addEventListener("mouseup", function (event) {
    if (activePageKey !== "game") {
      return;
    }

    if (ball.launch()) {
      if (!started) {
        started = true;
        timer--;
      }
    }
  });

  // Main
  function update(deltaTime) {
    ball.update(deltaTime, levelData.walls);
    checkHoleCollision();

    perSecondTime += deltaTime / 1000;
    if (perSecondTime > 1) {
      perSecondTime = 0;
      updateTimer();
    }
  }

  function draw(deltaTime) {
    ctx.clearRect(0, 0, 9999, 9999);
    ctx.save();

    drawMap();
    drawHole(deltaTime);
    ball.draw(ctx);
    drawTimer();

    ctx.restore();
  }

  function init() {
    initLevel();
    cacheMap();
  }

  function loop(currentTime) {
    const deltaTime = currentTime - lastTime || 0;

    update(deltaTime);
    draw(deltaTime);

    lastTime = currentTime;

    window.requestAnimationFrame(loop);
  }

  init();
  loop();
}
