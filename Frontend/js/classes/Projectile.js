class Projectile {
  constructor(
    position,
    velocity,
    radius,
    damage,
    owner = null,
    lifetimeTicks,
    color
  ) {
    this.x = position.x;
    this.y = position.y;
    this.vx = velocity.vx;
    this.vy = velocity.vy;
    this.radius = radius;
    this.damage = damage;
    this.owner = owner;
    this.lifetimeTicks = Math.max(1, Math.floor(lifetimeTicks));
    this.alive = true;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetimeTicks -= 1;
    if (this.lifetimeTicks <= 0) this.alive = false;
  }

  draw(worldOffsetX, worldOffsetY) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(
      this.x + worldOffsetX,
      this.y + worldOffsetY,
      this.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  checkCollisionWithBuilding(building) {
    let testX = this.x;
    let testY = this.y;
    if (this.x < building.worldPosition.x) testX = building.worldPosition.x;
    else if (this.x > building.worldPosition.x + building.width)
      testX = building.worldPosition.x + building.width;
    if (this.y < building.worldPosition.y) testY = building.worldPosition.y;
    else if (this.y > building.worldPosition.y + building.height)
      testY = building.worldPosition.y + building.height;
    const dx = this.x - testX;
    const dy = this.y - testY;
    const distSq = dx * dx + dy * dy;
    if (distSq <= this.radius * this.radius) {
      this.alive = false;
      return true;
    }
    return false;
  }
}
