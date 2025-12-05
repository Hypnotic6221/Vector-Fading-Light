const EnemyNpcState = {
  IDLE: "idle",
  PATROLLING: "patrolling",
  FIGHTING: "fighting",
};

class NpcEnemyDrone extends Drone {
  constructor(
    { worldPosition = { x: 0, y: 0 } },
    primaryColor,
    secondaryColor
  ) {
    super({ worldPosition }, primaryColor, secondaryColor, 10, 50, 100);
    this.detectionRange = 650;
    this.attackRange = 500;
    this.state = EnemyNpcState.IDLE;
    this.fragmentValue = 15;
    this.tick = 0;
  }

  update(player, buildings) {
    // check which state should be set, according to range from player

    // use ticks to control behaviour over time, slow down actions
    // 30 ticks = 1 second
    if (this.tick >= 300) {
      this.tick = 0;
    }
    this.tick++;

    let distanceFromPlayer = this.getDistanceFromPlayer(player, buildings);

    if (
      distanceFromPlayer <= this.detectionRange &&
      this.state !== EnemyNpcState.FIGHTING
    ) {
      this.state = EnemyNpcState.FIGHTING;
    }

    if (
      distanceFromPlayer > this.detectionRange &&
      this.state === EnemyNpcState.FIGHTING
    ) {
      this.state = EnemyNpcState.PATROLLING;
    }

    // act according to the state
    switch (this.state) {
      case EnemyNpcState.IDLE:
        // change to patrolling after X ticks
        if (this.tick >= 150) {
          this.state = EnemyNpcState.PATROLLING;
        }
        break;
      case EnemyNpcState.PATROLLING:
        // move left for X ticks, move right for X ticks, check for collisions and move accordingly, change to idle with certain possibility

        break;
      case EnemyNpcState.FIGHTING:
        // if player in detection range start moving to player, the closer the slower, check collisions
        if (distanceFromPlayer > 200) {
          const dx = player.worldPosition.x - this.worldPosition.x;
          const dy = player.worldPosition.y - this.worldPosition.y;
          let moveX = 0;
          let moveY = 0;

          const axisDeadzone = 2;

          const dominanceRatio = 1.1;

          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx > axisDeadzone && absDy > axisDeadzone) {
            const ratio = absDx / absDy;
            if (ratio <= dominanceRatio && 1 / ratio <= dominanceRatio) {
              moveX = Math.sign(dx) * this.speed;
              moveY = Math.sign(dy) * this.speed;
            } else {
              if (absDx > absDy) moveX = Math.sign(dx) * this.speed;
              else moveY = Math.sign(dy) * this.speed;
            }
          } else {
            if (absDx > axisDeadzone) moveX = Math.sign(dx) * this.speed;
            if (absDy > axisDeadzone) moveY = Math.sign(dy) * this.speed;
          }

          const length = Math.sqrt(moveX ** 2 + moveY ** 2);
          let finalMoveX = 0;
          let finalMoveY = 0;

          if (length > 0) {
            finalMoveX = (moveX / length) * this.speed;
            finalMoveY = (moveY / length) * this.speed;
          }

          // save old position
          const oldX = this.worldPosition.x;
          const oldY = this.worldPosition.y;

          // try to move player in both new directions
          this.worldPosition.x += finalMoveX;
          this.worldPosition.y += finalMoveY;

          buildings.forEach((building) => {
            // check for collision with both directions to reduce the drone being stuck on a corner
            if (
              this.checkCollisionWithBuilding(building) ||
              this.checkCollisionWithWorldBorder(map_width, map_height)
            ) {
              this.worldPosition.x = oldX;
              this.worldPosition.y = oldY;

              // fine check for collision on x axis
              this.worldPosition.x += finalMoveX;
              if (
                this.checkCollisionWithBuilding(building) ||
                this.checkCollisionWithWorldBorder(map_width, map_height)
              ) {
                this.worldPosition.x = oldX;
              }

              // fine check for collision on y axis
              this.worldPosition.y += finalMoveY;
              if (
                this.checkCollisionWithBuilding(building) ||
                this.checkCollisionWithWorldBorder(map_width, map_height)
              ) {
                this.worldPosition.y = oldY;
              }
            }
          });
        }

        // if player in attack range shoot (not every tick!)
        if (distanceFromPlayer < this.attackRange) {
          if (this.tick % 10 === 0) {
            this.shoot(player.worldPosition.x, player.worldPosition.y, "red");
          }
        }
        break;
    }
  }
}
