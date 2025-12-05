const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// UI elements
const datafragmentsUI = document.getElementById("datafragments");
const healthUI = document.getElementById("health");
const speedStatUI = document.getElementById("speedLevel");
const damageStatUI = document.getElementById("damageLevel");
const healthStatUI = document.getElementById("healthLevel");
const gameOverScreen = document.getElementById("gameOver");

canvas.width = 1280;
canvas.height = 768;
canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// size of map in px
const map_width = 10000;
const map_height = 10000;

// save last pressed keys for smoother movement
const keyState = {};

// spawnpoints
const playerSpawnpoints = getPlayerSpawnpoints();
const dataFragmentSpawnpoints = getDatafragmentSpawnpoints();
const enemyNpcSpawnPoints = getEnemyNpcSpawnpoints();
const friendlyNpcSpawnPoints = getFriendlyNpcSpawnpoints();

// entity lists
const buildings = getBuildings();

const enemies = [];

const friendlies = [];

const projectiles = [];

const dataFragments = [];

// spawning entities
enemyNpcSpawnPoints.forEach((spawnpoint) => {
  // spawn enemy with ~50% chance
  if (Math.random() >= 0) {
    enemies.push(
      new NpcEnemyDrone({ worldPosition: spawnpoint }, "red", "black")
    );
  }
});

friendlyNpcSpawnPoints.forEach((spawnpoint) => {
  // spawn friendly npc with ~XX% chance
  if (Math.random() >= 0) {
    friendlies.push(
      new NpcFriendlyDrone({ worldPosition: spawnpoint }, "green", "orange")
    );
  }
});

dataFragmentSpawnpoints.forEach((spawnpoint) => {
  // spawn datafragment with ~75% chance
  if (Math.random() >= 0.25) {
    let rand = Math.random();
    // spawn depending on rarity
    if (rand <= 0.7) {
      dataFragments.push(
        new DataFragment({ position: spawnpoint }, FragmentType.COMMON)
      );
    } else if (rand <= 0.9) {
      dataFragments.push(
        new DataFragment({ position: spawnpoint }, FragmentType.RARE)
      );
    } else if (rand <= 1) {
      dataFragments.push(
        new DataFragment({ position: spawnpoint }, FragmentType.EPIC)
      );
    }
  }
});

const player = new PlayerDrone(
  {
    screenPosition: { x: canvasCenter.x, y: canvasCenter.y },
  },
  {
    worldPosition:
      playerSpawnpoints[Math.floor(Math.random() * playerSpawnpoints.length)], // select random spawnpoint from list
  },
  "blue",
  "lightblue"
);

// merge npc arrays
let npcDrones = enemies.concat(friendlies);

// init UI vars
datafragmentsUI.innerHTML = player.collectedFragmentsValue;
healthUI.innerHTML = player.health;

updateUpgradeUI();

const handle = setInterval(() => {
  // console.time("start interval");

  // draw background
  ctx.fillStyle = "rgba(150, 150, 150, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //TODO: add deltaTime to player movement
  //TODO: add collision detection with other drones

  // update player world position
  let moveX = 0;
  let moveY = 0;

  if (keyState["w"]) {
    moveY = -player.speed;
  }
  if (keyState["s"]) {
    moveY = player.speed;
  }
  if (keyState["a"]) {
    moveX = -player.speed;
  }
  if (keyState["d"]) {
    moveX = player.speed;
  }

  const length = Math.sqrt(moveX ** 2 + moveY ** 2);
  let finalMoveX = 0;
  let finalMoveY = 0;

  if (length > 0) {
    finalMoveX = (moveX / length) * player.speed;
    finalMoveY = (moveY / length) * player.speed;
  }

  // save old position
  const oldX = player.worldPosition.x;
  const oldY = player.worldPosition.y;

  // try to move player in both new directions
  player.worldPosition.x += finalMoveX;
  player.worldPosition.y += finalMoveY;

  buildings.forEach((building) => {
    // check for collision with both directions to reduce the drone being stuck on a corner
    if (
      player.checkCollisionWithBuilding(building) ||
      player.checkCollisionWithWorldBorder(map_width, map_height)
    ) {
      player.worldPosition.x = oldX;
      player.worldPosition.y = oldY;

      // fine check for collision on x axis
      player.worldPosition.x += finalMoveX;
      if (
        player.checkCollisionWithBuilding(building) ||
        player.checkCollisionWithWorldBorder(map_width, map_height)
      ) {
        player.worldPosition.x = oldX;
      }

      // fine check for collision on y axis
      player.worldPosition.y += finalMoveY;
      if (
        player.checkCollisionWithBuilding(building) ||
        player.checkCollisionWithWorldBorder(map_width, map_height)
      ) {
        player.worldPosition.y = oldY;
      }
    }
  });

  // check for collision with data fragments
  dataFragments.forEach((dataFragment) => {
    if (player.checkCollisionWithDataFragment(dataFragment)) {
      // remove from data fragments list
      let index = dataFragments.indexOf(dataFragment);
      dataFragments.splice(index, 1);
      // add to collected fragment value of player
      player.collectedFragmentsValue += dataFragment.value;
      // update counter in UI
      datafragmentsUI.innerHTML = player.collectedFragmentsValue;
    }
    // TODO: respawn collected data fragments
  });

  // offset between screen and map coordinates
  const worldOffsetX = player.screenPosition.x - player.worldPosition.x;
  const worldOffsetY = player.screenPosition.y - player.worldPosition.y;

  // draw buildings
  buildings.forEach((building) => {
    building.draw(worldOffsetX, worldOffsetY);
  });

  // draw world border
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.moveTo(0 + worldOffsetX, 0 + worldOffsetY);
  ctx.lineTo(0 + worldOffsetX, 10000 + worldOffsetY);
  ctx.lineTo(10000 + worldOffsetX, 10000 + worldOffsetY);
  ctx.lineTo(10000 + worldOffsetX, 0 + worldOffsetY);
  ctx.lineTo(0 + worldOffsetX, 0 + worldOffsetY);
  ctx.stroke();
  ctx.lineWidth = 1;

  // calculate angle of player
  let angleRad = Math.atan2(mouse.y, mouse.x);

  // draw lightcone
  // player.drawLightCone(angleRad, buildings, worldOffsetX, worldOffsetY);
  // console.timeEnd("start interval");

  // draw player
  ctx.save();
  ctx.translate(canvasCenter.x, canvasCenter.y);
  ctx.rotate(angleRad + Math.PI / 2); // additional 90 deg because of default coordinate system
  player.draw();
  ctx.translate(-canvasCenter.x, -canvasCenter.y);
  ctx.restore();

  // draw healthbar
  player.drawHealthBar(worldOffsetX, worldOffsetY);

  // draw & update npcs
  npcDrones.forEach((npc) => {
    npc.update(player, buildings);
    if (npc.state === EnemyNpcState.FIGHTING && FriendlyNpcState.FLEEING) {
      // calculate npc screen position
      const screenX = npc.worldPosition.x + worldOffsetX;
      const screenY = npc.worldPosition.y + worldOffsetY;

      const angleRad = Math.atan2(
        player.worldPosition.y - npc.worldPosition.y,
        player.worldPosition.x - npc.worldPosition.x
      );

      // rotate around npc center then draw
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(angleRad + Math.PI / 2);
      npc.draw(worldOffsetX - screenX, worldOffsetY - screenY);
      ctx.restore();
    } else {
      npc.draw(worldOffsetX, worldOffsetY);
    }
  });

  // draw datafragments
  dataFragments.forEach((dataFragment) => {
    dataFragment.draw(worldOffsetX, worldOffsetY);
  });

  // update and draw projectiles
  for (const proj of projectiles) {
    if (!proj.alive) continue;
    proj.update();

    // remove on world border
    if (proj.x < 0 || proj.x > map_width || proj.y < 0 || proj.y > map_height) {
      proj.alive = false;
      continue;
    }

    // collision with buildings
    for (const building of buildings) {
      // closest point on rect to circle center
      if (proj.checkCollisionWithBuilding(building)) {
        break;
      }
    }

    // collision with npcs
    for (let i = 0; i < npcDrones.length; i++) {
      const npc = npcDrones[i];
      if (proj.owner === npc) continue; // don't hit owner
      const dx = proj.x - npc.worldPosition.x;
      const dy = proj.y - npc.worldPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= proj.radius + npc.hitboxRadius) {
        npc.health -= proj.damage;
        proj.alive = false;
        if (npc.health <= 0) {
          npcDrones.splice(i, 1);
          i--;
          if (proj.owner === player) {
            player.collectedFragmentsValue += npc.fragmentValue;
            updateUpgradeUI();
            datafragmentsUI.innerHTML = player.collectedFragmentsValue;
          }
        }
        break;
      }
    }

    // collision with player
    if (proj.owner !== player) {
      const dxp = proj.x - player.worldPosition.x;
      const dyp = proj.y - player.worldPosition.y;
      const distp = Math.sqrt(dxp * dxp + dyp * dyp);
      if (distp <= proj.radius + player.hitboxRadius) {
        player.health -= proj.damage;
        proj.alive = false;
        // update UI
        healthUI.innerHTML = Math.max(0, Math.floor(player.health));
        if (player.health <= 0) {
          // draw healthbar so its not stuck on last hp amount
          player.drawHealthBar(worldOffsetX, worldOffsetY);
          gameOverScreen.style.display = "flex";
          clearInterval(handle);
        }
      }
    }
  }

  // draw projectiles
  for (const proj of projectiles) {
    if (!proj.alive) continue;
    proj.draw(worldOffsetX, worldOffsetY);
  }

  // cleanup dead projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].alive) projectiles.splice(i, 1);
  }
}, 1000 / 30);

function restartGame() {
  location.reload();
}

const mouse = {
  x: undefined,
  y: undefined,
};

/* ----- EVENT LISTENERS ----- */

window.addEventListener("mousemove", (event) => {
  const canvasPos = canvas.getBoundingClientRect(); // get the distance from viewport to canvas element to correctly calculate x and y pos of mouse
  // only update mouse position if position is inside game canvas
  if (
    event.clientX >= canvasPos.left &&
    event.clientX <= canvasPos.left + canvasPos.width &&
    event.clientY >= canvasPos.top &&
    event.clientY <= canvasPos.top + canvasPos.height
  ) {
    mouse.x = event.clientX - canvasPos.left - canvasCenter.x;
    mouse.y = event.clientY - canvasPos.top - canvasCenter.y;
  }
});

window.addEventListener("keydown", (event) => {
  keyState[event.key.toLowerCase()] = true;
  if (event.key === "1") {
    tryUpgrade("speed");
  } else if (event.key === "2") {
    tryUpgrade("damage");
  } else if (event.key === "3") {
    tryUpgrade("health");
  }
});

window.addEventListener("keyup", (event) => {
  keyState[event.key.toLowerCase()] = false;
});

// left mouse click to shoot
window.addEventListener("mousedown", (event) => {
  // only left button
  if (event.button !== 0) return;
  // ensure mouse is inside canvas
  if (typeof mouse.x === "number" && typeof mouse.y === "number") {
    const targetWorldX = player.worldPosition.x + mouse.x;
    const targetWorldY = player.worldPosition.y + mouse.y;
    player.shoot(targetWorldX, targetWorldY, "darkgreen");
  }
});
