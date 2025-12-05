class Drone {
  constructor(
    { worldPosition = { x: 0, y: 0 } },
    primaryColor,
    secondaryColor,
    speed,
    damage,
    maxHealth,
    canAttack = true
  ) {
    this.width = 24;
    this.height = 50;
    this.wingOffset = 10;

    this.hitboxRadius = 50;

    this.worldPosition = worldPosition;

    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.canAttack = canAttack;

    // variable drone stats
    this.speed = speed;
    this.damage = damage;
    this.maxHealth = maxHealth;

    // changing vars
    this.health = this.maxHealth;
  }

  draw(worldOffsetX, worldOffsetY) {
    ctx.fillStyle = this.primaryColor;
    // drone body
    ctx.fillRect(
      this.worldPosition.x + worldOffsetX - this.width / 2,
      this.worldPosition.y + worldOffsetY - this.height / 2,
      this.width,
      this.height
    );

    // draw hitbox
    // ctx.beginPath();
    // ctx.arc(0, 0, this.hitboxRadius, 0, 2 * Math.PI);
    // ctx.stroke();

    // drone "wings"
    ctx.strokeStyle = this.secondaryColor;
    this.drawDroneWing(
      {
        position: {
          x: this.worldPosition.x + worldOffsetX,
          y: this.worldPosition.y + worldOffsetY,
        },
      },
      this.width,
      this.height,
      this.wingOffset,
      this.wingOffset
    ); // bottom right
    this.drawDroneWing(
      {
        position: {
          x: this.worldPosition.x + worldOffsetX,
          y: this.worldPosition.y + worldOffsetY,
        },
      },
      -this.width,
      this.height,
      -this.wingOffset,
      this.wingOffset
    ); // bottom left
    this.drawDroneWing(
      {
        position: {
          x: this.worldPosition.x + worldOffsetX,
          y: this.worldPosition.y + worldOffsetY,
        },
      },
      -this.width,
      -this.height,
      -this.wingOffset,
      -this.wingOffset
    ); // top left
    this.drawDroneWing(
      {
        position: {
          x: this.worldPosition.x + worldOffsetX,
          y: this.worldPosition.y + worldOffsetY,
        },
      },
      this.width,
      -this.height,
      this.wingOffset,
      -this.wingOffset
    ); // top right

    if (this.canAttack) {
      // weapon
      this.drawWeapon({
        position: {
          x: this.worldPosition.x + worldOffsetX,
          y: this.worldPosition.y + worldOffsetY,
        },
      });
    }

    // health bar
    this.drawHealthBar(worldOffsetX, worldOffsetY);
  }

  // spawn a projectile towards the given world coordinates
  shoot(targetX, targetY, color) {
    const speed = 600;
    const damage = this.damage;
    const radius = 4;
    const lifetime = 2.0; // seconds

    const TICKS_PER_SEC = 30;
    const dirX = targetX - this.worldPosition.x;
    const dirY = targetY - this.worldPosition.y;
    const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
    const vx = (dirX / len) * (speed / TICKS_PER_SEC);
    const vy = (dirY / len) * (speed / TICKS_PER_SEC);

    // lifetime in ticks
    const lifetimeTicks = Math.max(1, Math.floor(lifetime * TICKS_PER_SEC));

    // create projectile and push to global projectiles array
    projectiles.push(
      new Projectile(
        { x: this.worldPosition.x, y: this.worldPosition.y },
        { vx: vx, vy: vy },
        radius,
        damage,
        this,
        lifetimeTicks,
        color
      )
    );
  }

  drawHealthBar(worldOffsetX, worldOffsetY) {
    const barWidth = 60;
    const barHeight = 8;
    const x = this.worldPosition.x + worldOffsetX - barWidth / 2;
    const y = this.worldPosition.y + worldOffsetY - this.height / 2 - 50;

    // background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, y, barWidth, barHeight);

    // health
    const healthRatio = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = "rgba(50,200,50,0.9)";
    ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
  }

  // checks for a collision with a single building using a circular hitbox for the drone
  // returns true if there is a collision
  checkCollisionWithBuilding(building) {
    let testX = this.worldPosition.x;
    let testY = this.worldPosition.y;

    // test which side of the building the drone is on (which edge is closest)
    if (this.worldPosition.x < building.worldPosition.x) {
      testX = building.worldPosition.x;
    } else if (
      this.worldPosition.x >
      building.worldPosition.x + building.width
    ) {
      testX = building.worldPosition.x + building.width;
    }

    if (this.worldPosition.y < building.worldPosition.y) {
      testY = building.worldPosition.y;
    } else if (
      this.worldPosition.y >
      building.worldPosition.y + building.height
    ) {
      testY = building.worldPosition.y + building.height;
    }

    // calculate distance to closest edge
    let distX = this.worldPosition.x - testX;
    let distY = this.worldPosition.y - testY;
    let distance = Math.sqrt(distX ** 2 + distY ** 2);

    if (distance <= this.hitboxRadius) {
      return true;
    }

    return false;
  }

  checkCollisionWithWorldBorder(mapWidth, mapHeight) {
    if (
      this.worldPosition.x < 0 + this.hitboxRadius ||
      this.worldPosition.x > mapWidth - this.hitboxRadius ||
      this.worldPosition.y < 0 + this.hitboxRadius ||
      this.worldPosition.y > mapHeight - this.hitboxRadius
    ) {
      return true;
    }
    return false;
  }

  checkCollisionWithDataFragment(dataFragment) {
    let deltaPlayerFragment = Math.sqrt(
      (player.worldPosition.x - dataFragment.position.x) ** 2 +
        (player.worldPosition.y - dataFragment.position.y) ** 2
    );
    if (deltaPlayerFragment < dataFragment.hitboxRadius + player.hitboxRadius) {
      return true;
    }
    return false;
  }

  getDistanceFromPlayer(player) {
    return Math.sqrt(
      (this.worldPosition.x - player.worldPosition.x) ** 2 +
        (this.worldPosition.y - player.worldPosition.y) ** 2
    );
  }

  checkCollisionWithDrone(droneA, droneB) {
    let distanceBetweenDrones = Math.sqrt(
      (droneA.worldPosition.x - droneB.worldPosition.x) ** 2 +
        (droneA.worldPosition.y - droneB.worldPosition.y) ** 2
    );
    if (distanceBetweenDrones <= droneA.hitboxRadius + droneB.hitboxRadius) {
      return true;
    }
    return false;
  }

  drawDroneWing(
    { position = { x: 0, y: 0 } },
    width,
    height,
    wingOffsetX,
    wingOffsetY
  ) {
    ctx.beginPath();
    ctx.arc(
      position.x + width / 2 + wingOffsetX,
      position.y + height / 2 + wingOffsetY,
      15,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }

  drawWeapon({ position = { x: 0, y: 0 } }) {
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(position.x, position.y - 100);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}
