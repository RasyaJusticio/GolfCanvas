class Ball {
  #ENERGY_DECAY = 1 / 80;
  #LAUNCH_RANGE = 80;
  #RING_GAP = 12;

  constructor(mouse) {
    this.x = 0;
    this.y = 0;
    this.radius = 8;

    this.direction = { x: 0, y: 0 };
    this.energy = 0;

    this.mouse = mouse;
    this.aiming = false;
  }

  update(deltaTime, walls) {
    if (this.energy > 0) {
      this.energy -= this.#ENERGY_DECAY;
    }

    if (this.energy < 0) {
      this.energy = 0;
    }

    this.x += this.direction.x * this.energy * deltaTime;
    this.y += this.direction.y * this.energy * deltaTime;

    this.#detectWallCollision(walls);
  }

  #detectWallCollision(walls) {
    let collide = false;

    for (let i = 0; i < walls.length - 1; i++) {
      const p1 = walls[i];
      const p2 = walls[i + 1];

      const axis = {
        x: p2.y - p1.y,
        y: p1.x - p2.x,
      };

      const magnitude = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
      axis.x /= magnitude;
      axis.y /= magnitude;

      const ballProjection = this.#project(this, axis);
      const wallProjection = this.#project([p1, p2], axis);

      ballProjection.min -= this.radius;
      ballProjection.max += this.radius;

      if (this.#overlap(ballProjection, wallProjection)) {
        collide = true;

        const dotProduct =
          this.direction.x * axis.x + this.direction.y * axis.y;
        this.direction.x -= 2 * dotProduct * axis.x;
        this.direction.y -= 2 * dotProduct * axis.y;
      }
    }

    return collide;
  }

  #project(shape, axis) {
    let min = Infinity;
    let max = -Infinity;

    if (Array.isArray(shape)) {
      for (let i = 0; i < shape.length; i++) {
        const point = shape[i];
        const dotProduct = point.x * axis.x + point.y * axis.y;
        min = Math.min(min, dotProduct);
        max = Math.max(max, dotProduct);
      }
    } else {
      const dotProduct = shape.x * axis.x + shape.y * axis.y;
      min = Math.min(min, dotProduct);
      max = Math.max(max, dotProduct);
    }

    return { min, max };
  }

  #overlap(projection1, projection2) {
    return (
      projection1.min <= projection2.max && projection2.min <= projection1.max
    );
  }

  startAiming() {
    if (this.energy > 0) {
      return;
    }

    const distance = calculateDistance(this, this.mouse);
    if (distance <= this.#LAUNCH_RANGE) {
      this.aiming = true;
    }
  }

  launch() {
    if (!this.aiming) {
      return;
    }

    this.aiming = false;

    const angle = calculateAngle(this, this.mouse);
    this.direction.x = -Math.cos(angle);
    this.direction.y = -Math.sin(angle);

    let distance = calculateDistance(this, this.mouse);
    if (distance > this.#LAUNCH_RANGE) {
      distance = this.#LAUNCH_RANGE;
    }
    this.energy = distance / this.#LAUNCH_RANGE;
  }

  draw(ctx) {
    if (this.aiming) {
      this.drawPointer(ctx);
    }

    if (this.energy <= 0 && !this.aiming) {
      this.drawRing(ctx);
    }

    ctx.save();

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.restore();
  }

  drawPointer(ctx) {
    const angle = calculateAngle(this, this.mouse);
    let distance = calculateDistance(this, this.mouse);
    if (distance > this.#LAUNCH_RANGE) {
      distance = this.#LAUNCH_RANGE;
    }

    const arrowEndX = this.x + this.#LAUNCH_RANGE * -Math.cos(angle);
    const arrowEndY = this.y + this.#LAUNCH_RANGE * -Math.sin(angle);

    const levelEndX = this.x + distance * -Math.cos(angle);
    const levelEndY = this.y + distance * -Math.sin(angle);

    ctx.save();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();

    ctx.strokeStyle = "green";

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(levelEndX, levelEndY);
    ctx.stroke();

    ctx.restore();
  }

  drawRing(ctx) {
    ctx.save();

    ctx.strokeStyle = "white";
    ctx.lineWidth = this.radius / 2;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.#LAUNCH_RANGE, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.restore();
  }
}

function calculateAngle(vector1, vector2) {
  return Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
}

function calculateDistance(vector1, vector2) {
  const displacementX = vector2.x - vector1.x;
  const displacementY = vector2.y - vector1.y;

  return Math.sqrt(
    displacementX * displacementX + displacementY * displacementY
  );
}
