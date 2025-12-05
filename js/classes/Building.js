class Building {
  constructor({ worldPosition = { x: 0, y: 0 } }, width, height, color) {
    this.worldPosition = worldPosition;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(worldOffsetX, worldOffsetY) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.worldPosition.x + worldOffsetX,
      this.worldPosition.y + worldOffsetY,
      this.width,
      this.height
    );
  }
}
