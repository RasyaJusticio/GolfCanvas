{
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  /** @type {HTMLCanvasElement} */
  const cacheCanvas = document.querySelector("#cacheCanvas");
  const cacheCtx = cacheCanvas.getContext("2d");

  const mouse = { x: 0, y: 0 };
  const hole = { x: 0, y: 0, radius: 14 };
  const ball = new Ball(mouse);

  let currentLevel = 0;
  let levelData = levels[currentLevel];
  let lastTime = 0;

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

  // Util Functions
  function checkHoleCollision() {
    const distance = Math.sqrt((hole.x - ball.x) ** 2 + (hole.y - ball.y) ** 2);

    if (distance <= ball.radius + hole.radius) {
      ball.energy = 0;
    }
  }

  // Draw Functions
  function drawHole() {
    ctx.save();

    ctx.fillStyle = "black";

    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius + 4, 0, 2 * Math.PI, false);
    ctx.fill();

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

    ball.launch();
  });

  // Main
  function update(deltaTime) {
    ball.update(deltaTime, levelData.walls);
    checkHoleCollision();
  }

  function draw() {
    ctx.clearRect(0, 0, 9999, 9999);
    ctx.save();

    drawMap();
    drawHole();
    ball.draw(ctx);

    ctx.restore();
  }

  function init() {
    initLevel();
    cacheMap();
  }

  function loop(currentTime) {
    const deltaTime = currentTime - lastTime || 0;

    update(deltaTime);
    draw();

    lastTime = currentTime;

    window.requestAnimationFrame(loop);
  }

  init();
  loop();
}
