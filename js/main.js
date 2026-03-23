import { HEIGHT, WIDTH } from "./data.js?v=rollback5";
import { Game } from "./game.js?v=rollback5";
import { Renderer } from "./render.js?v=rollback5";

const canvas = document.getElementById("gameCanvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;

const ui = {
  modeLabel: document.getElementById("modeLabel"),
  dogScore: document.getElementById("dogScore"),
  ownerScore: document.getElementById("ownerScore"),
  timeLeft: document.getElementById("timeLeft"),
  angerLabel: document.getElementById("angerLabel"),
  angerFill: document.getElementById("angerFill"),
  statusText: document.getElementById("statusText"),
  menuOverlay: document.getElementById("menuOverlay"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultTitle: document.getElementById("resultTitle"),
  resultReason: document.getElementById("resultReason"),
  resultDogBlock: document.getElementById("resultDogBlock"),
  resultOwnerBlock: document.getElementById("resultOwnerBlock"),
  resultDogLabel: document.getElementById("resultDogLabel"),
  resultOwnerLabel: document.getElementById("resultOwnerLabel"),
  resultDogScore: document.getElementById("resultDogScore"),
  resultOwnerScore: document.getElementById("resultOwnerScore"),
  playAgainButton: document.getElementById("playAgainButton"),
  menuButton: document.getElementById("menuButton"),
};

const game = new Game(ui);
const renderer = new Renderer(canvas, game);
const blockedKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Spacebar"]);

document.addEventListener("keydown", (event) => {
  if (blockedKeys.has(event.key)) {
    event.preventDefault();
  }

  game.setKey(event.key, true);
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (key === "r" && game.state.mode) {
    game.restart();
  }

  if (key === "p" && game.state.screen === "playing") {
    game.togglePause();
  }
});

document.addEventListener("keyup", (event) => {
  if (blockedKeys.has(event.key)) {
    event.preventDefault();
  }

  game.setKey(event.key, false);
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    game.start(button.dataset.mode);
  });
});

ui.playAgainButton.addEventListener("click", () => {
  if (game.state.lastMode) {
    game.start(game.state.lastMode);
  }
});

ui.menuButton.addEventListener("click", () => {
  game.backToMenu();
});

game.updateHud();
ui.statusText.textContent = "Choose a mode to begin.";

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  game.update(dt);
  renderer.render(now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
