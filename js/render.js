import { EXIT, HEIGHT, OBSTACLES, PICKUP_LIBRARY, ROUTE, WIDTH } from "./data.js?v=rollback5";
import { distance, clamp, roundedRectPath } from "./utils.js?v=rollback5";

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;
  }

  render(time) {
    const ctx = this.ctx;
    const state = this.game.state;

    this.drawBackground();
    for (const obstacle of OBSTACLES) {
      this.drawObstacle(obstacle);
    }

    if (state.entities) {
      this.drawPickups(time);
      this.drawLeash();
      this.drawOwner(state.entities.owner);
      this.drawDog(state.entities.dog);
      this.drawFx();
    } else {
      ctx.fillStyle = "rgba(39, 56, 95, 0.14)";
      ctx.font = "700 38px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText("Choose a mode to start the walk", WIDTH / 2, HEIGHT / 2);
      ctx.textAlign = "left";
    }

    this.drawOverlayText();
  }

  drawBackground() {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, "#c8f4ff");
    sky.addColorStop(0.26, "#f7f7ff");
    sky.addColorStop(1, "#ffe6a9");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const lawn = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    lawn.addColorStop(0, "#8bf06d");
    lawn.addColorStop(1, "#61d65f");
    ctx.fillStyle = lawn;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let x = 0; x < WIDTH; x += 96) {
      for (let y = 0; y < HEIGHT; y += 96) {
        ctx.fillStyle = (x / 96 + y / 96) % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(34,140,44,0.04)";
        ctx.fillRect(x, y, 96, 96);
      }
    }

    const pathGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    pathGradient.addColorStop(0, "#fff9cf");
    pathGradient.addColorStop(0.5, "#ffe285");
    pathGradient.addColorStop(1, "#ffc95a");
    ctx.strokeStyle = pathGradient;
    ctx.lineWidth = 124;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(ROUTE[0].x, ROUTE[0].y);
    for (let i = 1; i < ROUTE.length; i += 1) {
      ctx.lineTo(ROUTE[i].x, ROUTE[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 8;
    ctx.setLineDash([10, 18]);
    ctx.beginPath();
    ctx.moveTo(ROUTE[0].x, ROUTE[0].y);
    for (let i = 1; i < ROUTE.length; i += 1) {
      ctx.lineTo(ROUTE[i].x, ROUTE[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    this.drawCloud(120, 86, 1);
    this.drawCloud(344, 58, 0.78);
    this.drawCloud(748, 88, 0.92);

    this.drawHouse(86, 92, "#ffd0e5", "#ff6ca9");
    this.drawHouse(904, 548, "#d4ebff", "#4e8cff");
    this.drawHouse(930, 68, "#fff2b8", "#ffb62d");
    this.drawHouse(530, 88, "#ffe5b8", "#ff7a5f");

    const flowerBeds = [
      [76, 314, 68, 40, "#ff77ab"],
      [358, 540, 78, 42, "#ffa74e"],
      [904, 278, 74, 44, "#c36cff"],
    ];
    for (const [x, y, w, h, color] of flowerBeds) {
      ctx.fillStyle = "#42a651";
      roundedRectPath(ctx, x - w / 2, y - h / 2, w, h, 18);
      ctx.fill();
      ctx.fillStyle = color;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.arc(x + i * 12, y + Math.sin(i) * 4, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "#ffe74d";
    ctx.beginPath();
    ctx.arc(EXIT.x, EXIT.y, EXIT.radius + 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fffef0";
    ctx.beginPath();
    ctx.arc(EXIT.x, EXIT.y, EXIT.radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff9e1c";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = "#ff9e1c";
    ctx.font = "700 18px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("HOME", EXIT.x, EXIT.y + 6);
    ctx.textAlign = "left";
  }

  drawCloud(x, y, scale) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.arc(20, -10, 14, 0, Math.PI * 2);
    ctx.arc(42, 0, 18, 0, Math.PI * 2);
    ctx.arc(22, 8, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHouse(x, y, bodyColor, roofColor) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(-36, -10);
    ctx.lineTo(0, -36);
    ctx.lineTo(36, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bodyColor;
    roundedRectPath(ctx, -30, -10, 60, 48, 12);
    ctx.fill();
    ctx.fillStyle = "#fff8da";
    roundedRectPath(ctx, -10, 6, 18, 32, 8);
    ctx.fill();
    ctx.fillStyle = "#cdeeff";
    roundedRectPath(ctx, -24, 2, 10, 12, 4);
    ctx.fill();
    roundedRectPath(ctx, 14, 2, 10, 12, 4);
    ctx.fill();
    ctx.restore();
  }

  drawObstacle(obstacle) {}

  drawPickupIcon(icon, x, y, scale = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (icon === "smell") {
      ctx.strokeStyle = "#2f7c25";
      ctx.lineWidth = 3;
      for (const offset of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.moveTo(offset, 10);
        ctx.bezierCurveTo(offset - 7, 4, offset + 8, -2, offset, -10);
        ctx.stroke();
      }
    }

    if (icon === "bone") {
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(-10, -4, 6, 0, Math.PI * 2);
      ctx.arc(-10, 6, 6, 0, Math.PI * 2);
      ctx.arc(10, -4, 6, 0, Math.PI * 2);
      ctx.arc(10, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      roundedRectPath(ctx, -12, -4, 24, 10, 5);
      ctx.fill();
      ctx.strokeStyle = "#dbc488";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (icon === "dogpal") {
      ctx.fillStyle = "#a65f32";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-16, -18);
      ctx.lineTo(-4, -12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(16, -18);
      ctx.lineTo(4, -12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-4, -1, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e2434";
      ctx.beginPath();
      ctx.arc(-4, -1, 1.2, 0, Math.PI * 2);
      ctx.arc(4, -1, 1.2, 0, Math.PI * 2);
      ctx.arc(0, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (icon === "chocolate") {
      ctx.fillStyle = "#78442f";
      roundedRectPath(ctx, -14, -12, 28, 24, 4);
      ctx.fill();
      ctx.strokeStyle = "#c48c69";
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-14 + (i + 2) * 7, -12);
        ctx.lineTo(-14 + (i + 2) * 7, 12);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
    }

    if (icon === "cash") {
      ctx.fillStyle = "#e1ffe8";
      roundedRectPath(ctx, -16, -11, 32, 22, 5);
      ctx.fill();
      ctx.strokeStyle = "#1f9b57";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#1f9b57";
      ctx.font = "700 16px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText("$", 0, 6);
    }

    if (icon === "chat") {
      ctx.fillStyle = "#f7fbff";
      roundedRectPath(ctx, -16, -14, 32, 24, 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.lineTo(6, 18);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6d8cff";
      ctx.beginPath();
      ctx.arc(-8, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(8, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (icon === "paw") {
      ctx.fillStyle = "#9b5d36";
      ctx.beginPath();
      ctx.arc(0, 6, 7, 0, Math.PI * 2);
      ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      ctx.arc(0, -8, 4, 0, Math.PI * 2);
      ctx.arc(8, -4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.textAlign = "left";
  }

  drawPickups(time) {
    const ctx = this.ctx;
    for (const pickup of this.game.state.pickups) {
      if (!pickup.active) continue;
      const info = PICKUP_LIBRARY[pickup.type];
      const pulse = 1 + Math.sin(time * 0.004 + pickup.pulse) * 0.08;

      ctx.fillStyle = info.glow;
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, info.radius * 1.75 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = info.color;
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, info.radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      this.drawPickupIcon(info.icon, pickup.x, pickup.y, pulse);

      ctx.fillStyle = "rgba(30, 36, 52, 0.85)";
      ctx.font = "700 11px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(info.label, pickup.x, pickup.y - info.radius - 12);
    }
    ctx.textAlign = "left";
  }

  drawLeash() {
    const { dog, owner } = this.game.state.entities;
    const ctx = this.ctx;
    const dist = distance(dog, owner);
    const tension = clamp((dist - 92) / 60, 0, 1);

    ctx.strokeStyle = `rgba(255, 113, 73, ${0.42 + tension * 0.45})`;
    ctx.lineWidth = 6 + tension * 5;
    ctx.beginPath();
    ctx.moveTo(dog.x, dog.y);
    ctx.quadraticCurveTo((dog.x + owner.x) / 2, (dog.y + owner.y) / 2 - 14, owner.x, owner.y);
    ctx.stroke();
  }

  drawDog(entity) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.scale(entity.facing, 1);

    ctx.fillStyle = "rgba(39, 56, 95, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 24, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b4028";
    ctx.beginPath();
    ctx.ellipse(-5, 8, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(11, -1, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7c5034";
    for (const [x, y, r] of [
      [-14, 0, 5],
      [-8, -8, 5],
      [0, -11, 4.5],
      [6, -7, 5],
      [-1, 2, 5.5],
      [8, 5, 4.5],
      [0, 11, 5.2],
      [-10, 10, 4.6],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#4b2d20";
    ctx.beginPath();
    ctx.moveTo(4, -7);
    ctx.quadraticCurveTo(1, -18, 10, -14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -7);
    ctx.quadraticCurveTo(20, -18, 18, -10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#a87757";
    ctx.beginPath();
    ctx.ellipse(13, 5, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(11, -4, 2.6, 0, Math.PI * 2);
    ctx.arc(16, -3, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e2434";
    ctx.beginPath();
    ctx.arc(11.2, -4, 1.1, 0, Math.PI * 2);
    ctx.arc(16.2, -3, 1.1, 0, Math.PI * 2);
    ctx.arc(18, 5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#5f3a26";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.quadraticCurveTo(-28, -4, -22, -15);
    ctx.stroke();

    ctx.strokeStyle = "#4ec37b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(2, 11, 9, 3.2, 5.75);
    ctx.stroke();
    ctx.restore();
  }

  drawOwner(entity) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.scale(entity.facing, 1);

    ctx.fillStyle = "rgba(39, 56, 95, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 24, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9a6547";
    ctx.beginPath();
    ctx.arc(0, -10, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2e211d";
    ctx.beginPath();
    ctx.arc(0, -14, 12.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.quadraticCurveTo(0, 6, 12, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffb36b";
    roundedRectPath(ctx, -12, -1, 24, 28, 10);
    ctx.fill();
    ctx.fillStyle = "#7d57c8";
    ctx.fillRect(-12, 16, 10, 18);
    ctx.fillRect(2, 16, 10, 18);

    ctx.fillStyle = "#9a6547";
    ctx.fillRect(-17, 1, 5, 16);
    ctx.fillRect(12, 1, 5, 16);

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-3, -10, 1.6, 0, Math.PI * 2);
    ctx.arc(3, -10, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e2434";
    ctx.beginPath();
    ctx.arc(-3, -10, 0.75, 0, Math.PI * 2);
    ctx.arc(3, -10, 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6b3722";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -6, 4.2, 0.35, 2.8);
    ctx.stroke();

    ctx.fillStyle = "#57c271";
    roundedRectPath(ctx, 10, 2, 10, 14, 4);
    ctx.fill();
    ctx.restore();
  }

  drawFx() {
    const ctx = this.ctx;
    for (const particle of this.game.state.fx) {
      ctx.globalAlpha = clamp(particle.life / 0.85, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawOverlayText() {
    const ctx = this.ctx;
    const state = this.game.state;
    if (state.screen !== "playing") return;

    if (state.paused) {
      ctx.fillStyle = "rgba(39, 56, 95, 0.42)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#fffaf0";
      ctx.font = "700 42px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2);
    }

    if (state.messageTimer > 0) {
      ctx.fillStyle = "rgba(39, 56, 95, 0.78)";
      roundedRectPath(ctx, 18, 578, 360, 40, 12);
      ctx.fill();
      ctx.fillStyle = "#fff8e8";
      ctx.font = "700 18px Trebuchet MS";
      ctx.textAlign = "left";
      ctx.fillText(state.pickupMessage, 34, 604);
    }
  }
}
