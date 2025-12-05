class PlayerDrone extends Drone {
  constructor(
    { screenPosition = { x: 0, y: 0 } },
    { worldPosition = { x: 0, y: 0 } },
    primaryColor,
    secondaryColor
  ) {
    super(
      { worldPosition },
      primaryColor,
      secondaryColor,
      upgradeConfig.speed[0].speed,
      upgradeConfig.damage[0].damage,
      upgradeConfig.health[0].maxHealth
    );

    this.screenPosition = screenPosition;

    // variable drone stats (upgradable)
    this.lightLength = 300; // length of lightcone
    this.lightBreadthRad = Math.PI / 4; // breadth of lightcone in radians

    this.collectedFragmentsValue = 0;

    this.upgradeLevels = {
      health: 1,
      speed: 1,
      damage: 1,
    };
  }

  draw() {
    ctx.fillStyle = this.primaryColor;
    // drone body
    ctx.fillRect(
      0 - this.width / 2,
      0 - this.height / 2,
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
      { position: { x: 0, y: 0 } },
      this.width,
      this.height,
      this.wingOffset,
      this.wingOffset
    ); // bottom right
    this.drawDroneWing(
      { position: { x: 0, y: 0 } },
      -this.width,
      this.height,
      -this.wingOffset,
      this.wingOffset
    ); // bottom left
    this.drawDroneWing(
      { position: { x: 0, y: 0 } },
      -this.width,
      -this.height,
      -this.wingOffset,
      -this.wingOffset
    ); // top left
    this.drawDroneWing(
      { position: { x: 0, y: 0 } },
      this.width,
      -this.height,
      this.wingOffset,
      -this.wingOffset
    ); // top right

    // weapon
    this.drawWeapon({ position: { x: 0, y: 0 } });
  }

  drawLightCone(angle, buildings, worldOffsetX, worldOffsetY) {
    // origin of light ray
    const rayOriginWorld = {
      x: this.worldPosition.x,
      y: this.worldPosition.y,
    };
    // angle in rad on the screen
    const rayAngle = angle;

    const rayEndPointWorld = this.#castRay(
      rayOriginWorld,
      rayAngle,
      this.lightLength,
      buildings
    );

    const rayOriginScreen = {
      x: this.screenPosition.x,
      y: this.screenPosition.y,
    };

    const rayEndPointScreen = {
      x: rayEndPointWorld.x + worldOffsetX,
      y: rayEndPointWorld.y + worldOffsetY,
    };

    ctx.beginPath();
    ctx.moveTo(rayOriginScreen.x, rayOriginScreen.y);
    ctx.lineTo(rayEndPointScreen.x, rayEndPointScreen.y);
    ctx.strokeStyle = "rgba(255, 255, 200, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  #castRay(rayOrigin, angle, maxLength, buildings) {
    // if the ray hits nothing
    const rayEndDefault = {
      x: rayOrigin.x + Math.cos(angle) * maxLength,
      y: rayOrigin.y + Math.sin(angle) * maxLength,
    };

    let closestIntersection = null;
    let minDistanceSquared = maxLength * maxLength;

    // INEFFICIENT: iterate through ALL buildings to find edges
    // -> could be optimized by only looking at nearby buildings in the future
    for (const building of buildings) {
      const rectEdges = [
        // top edge
        {
          p1: { x: building.worldPosition.x, y: building.worldPosition.y },
          p2: {
            x: building.worldPosition.x + building.width,
            y: building.worldPosition.y,
          },
        },
        // right edge
        {
          p1: {
            x: building.worldPosition.x + building.width,
            y: building.worldPosition.y,
          },
          p2: {
            x: building.worldPosition.x + building.width,
            y: building.worldPosition.y + building.height,
          },
        },
        // bottom edge
        {
          p1: {
            x: building.worldPosition.x + building.width,
            y: building.worldPosition.y + building.height,
          },
          p2: {
            x: building.worldPosition.x,
            y: building.worldPosition.y + building.height,
          },
        },
        // left edge
        {
          p1: {
            x: building.worldPosition.x,
            y: building.worldPosition.y + building.height,
          },
          p2: { x: building.worldPosition.x, y: building.worldPosition.y },
        },
      ];

      // check every edge for collision with light ray
      for (const edge of rectEdges) {
        const intersection = this.#getLineIntersection(
          rayOrigin,
          rayEndDefault,
          edge.p1,
          edge.p2
        );

        if (intersection) {
          // check if ray is close enough to collide with edge
          const distanceSquared = this.#getSquaredDistance(
            rayOrigin,
            intersection
          );
          if (distanceSquared < minDistanceSquared) {
            minDistanceSquared = distanceSquared;
            closestIntersection = intersection;
          }
        }
      }
    }

    return closestIntersection || rayEndDefault;
  }

  #getLineIntersection(p1, p2, p3, p4) {
    // coefficients for (p1 + t*(p2-p1)) and (p3 + u*(p4-p3))
    const s1_x = p2.x - p1.x;
    const s1_y = p2.y - p1.y;
    const s2_x = p4.x - p3.x;
    const s2_y = p4.y - p3.y;

    const denominator = -s2_x * s1_y + s1_x * s2_y;

    // if denominator == 0 the lines are parallel
    if (denominator === 0) {
      return null;
    }

    const s = (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) / denominator;
    const t = (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) / denominator;

    // check if intersection
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      const intersectionX = p1.x + t * s1_x;
      const intersectionY = p1.y + t * s1_y;
      return { x: intersectionX, y: intersectionY };
    }

    return null;
  }

  #getSquaredDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }
}
