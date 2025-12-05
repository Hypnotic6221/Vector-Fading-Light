const FriendlyNpcState = {
  IDLE: "idle",
  EXPLORING: "exploring",
  FLEEING: "fleeing",
};

class NpcFriendlyDrone extends Drone {
  constructor(
    { worldPosition = { x: 0, y: 0 } },
    primaryColor,
    secondaryColor
  ) {
    super({ worldPosition }, primaryColor, secondaryColor, 22, 100, 105, false);
    this.detectionRange = 700;
    this.fleeRange = 600;
    this.state = FriendlyNpcState.IDLE;
    this.fragmentValue = 40;
  }

  update(player, buildings) {
    // check which state should be set, according to range from player

    let distanceFromPlayer = this.getDistanceFromPlayer(player, buildings);

    if (
      distanceFromPlayer <= this.fleeRange &&
      this.state !== FriendlyNpcState.FLEEING
    ) {
      this.state = FriendlyNpcState.FLEEING;
    }

    if (
      distanceFromPlayer > this.fleeRange &&
      this.state === FriendlyNpcState.FLEEING
    ) {
      this.state = FriendlyNpcState.EXPLORING;
    }

    // act according to the state
    switch (this.state) {
      case FriendlyNpcState.IDLE:
        // change to exploring after X ticks
        break;
      case FriendlyNpcState.EXPLORING:
        // move into random direction, move slowly to explore, go to state idle with certain possibility
        break;
      case FriendlyNpcState.FLEEING:
        // move away from player, check collisions, move faster until out of detection range

        const dx = (player.worldPosition.x - this.worldPosition.x) * -1; // inverse to flee
        const dy = (player.worldPosition.y - this.worldPosition.y) * -1;
        let moveX = 0;
        let moveY = 0;

        const axisDeadzone = 6;

        const dominanceRatio = 1.25;

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

        break;
    }
  }
}
