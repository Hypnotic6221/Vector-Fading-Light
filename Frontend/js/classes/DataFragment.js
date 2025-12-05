const FragmentType = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
};

class DataFragment {
  constructor({ position = { x: 0, y: 0 } }, fragmentType) {
    this.position = position;
    this.type = fragmentType;
    this.size = 50;
    this.hitboxRadius = 30;

    // decide color and value based on fragment type, rarer is more valuable
    switch (fragmentType) {
      case FragmentType.COMMON:
        this.color = "lightgreen";
        this.numSegments = 1;
        this.value = 1;
        break;
      case FragmentType.RARE:
        this.color = "lightblue";
        this.numSegments = 2;
        this.value = 2;
        break;
      case FragmentType.EPIC:
        this.color = "darkviolet";
        this.numSegments = 5;
        this.value = 5;
    }
  }

  draw(worldOffsetX, worldOffsetY) {
    const discRadius = this.size * 0.4;
    const orbitRadius = this.size * 0.7;
    const baseSegmentRadius = this.size * 0.15;
    let x = this.position.x + worldOffsetX;
    let y = this.position.y + worldOffsetY;

    // draw hitbox
    // ctx.beginPath();
    // ctx.arc(x, y, this.hitboxRadius, 0, 2 * Math.PI);
    // ctx.stroke();

    // main disc
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, discRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // ring
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, discRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // white cross
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    const crossSize = discRadius * 0.6;
    ctx.beginPath();
    ctx.moveTo(x - crossSize / 2, y);
    ctx.lineTo(x + crossSize / 2, y);
    ctx.moveTo(x, y - crossSize / 2);
    ctx.lineTo(x, y + crossSize / 2);
    ctx.stroke();

    // orbiting circles
    for (let i = 0; i < this.numSegments; i++) {
      const angle = (i * 2 * Math.PI) / this.numSegments - Math.PI / 2;
      const segX = x + Math.cos(angle) * orbitRadius;
      const segY = y + Math.sin(angle) * orbitRadius;

      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.arc(segX, segY, baseSegmentRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}
