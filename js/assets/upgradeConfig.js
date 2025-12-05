const upgradeConfig = {
  speed: [
    { level: 1, cost: 0, speed: 10 },
    { level: 2, cost: 5, speed: 12 },
    { level: 3, cost: 12, speed: 15 },
    { level: 4, cost: 25, speed: 19 },
    { level: 5, cost: 40, speed: 24 },
    { level: "MAX", cost: "MAX", speed: "MAX" },
  ],
  damage: [
    { level: 1, cost: 0, damage: 25 },
    { level: 2, cost: 5, damage: 30 },
    { level: 3, cost: 12, damage: 36 },
    { level: 4, cost: 25, damage: 43 },
    { level: 5, cost: 40, damage: 51 },
    { level: "MAX", cost: "MAX", damage: "MAX" },
  ],
  health: [
    { level: 1, cost: 0, maxHealth: 100 },
    { level: 2, cost: 5, maxHealth: 120 },
    { level: 3, cost: 12, maxHealth: 150 },
    { level: 4, cost: 25, maxHealth: 190 },
    { level: 5, cost: 40, maxHealth: 240 },
    { level: "MAX", cost: "MAX", maxHealth: "MAX" },
  ],
};

// helper to update stat-level UI
function updateUpgradeUI() {
  speedStatUI.innerHTML = `(1) Speed (Lvl ${
    player.upgradeLevels.speed
  } - Cost ${upgradeConfig.speed[player.upgradeLevels.speed].cost})`;
  damageStatUI.innerHTML = `(2) Damage (Lvl ${
    player.upgradeLevels.damage
  } - Cost ${upgradeConfig.damage[player.upgradeLevels.damage].cost})`;
  healthStatUI.innerHTML = `(3) Health (Lvl ${
    player.upgradeLevels.health
  } - Cost ${upgradeConfig.speed[player.upgradeLevels.health].cost})`;
}

// attempt to apply an upgrade for a given stat ('health'|'speed'|'damage')
function tryUpgrade(stat) {
  const levels = upgradeConfig[stat];
  const currentLevel = player.upgradeLevels[stat];
  if (currentLevel >= levels.length - 1) {
    // already at max level
    return;
  }

  const next = levels[currentLevel];
  if (player.collectedFragmentsValue < next.cost) {
    // not enough fragments
    return;
  }

  // spend fragments
  player.collectedFragmentsValue -= next.cost;
  datafragmentsUI.innerHTML = player.collectedFragmentsValue;

  // apply stat changes
  if (stat === "health") {
    const oldMax = player.maxHealth;
    player.maxHealth = next.maxHealth;
    // increase current health by the difference so upgrade gives immediate benefit
    player.health += player.maxHealth - oldMax;
    if (player.health > player.maxHealth) player.health = player.maxHealth;
    healthUI.innerHTML = player.health;
  } else if (stat === "speed") {
    player.speed = next.speed;
  } else if (stat === "damage") {
    player.damage = next.damage;
  }

  // increase level and update UI
  player.upgradeLevels[stat] = currentLevel + 1;
  updateUpgradeUI();
}
