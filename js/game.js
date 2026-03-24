import { EXIT, HEIGHT, MODE_CONFIG, OBSTACLES, PICKUP_LIBRARY, ROUTE, WIDTH } from "./data.js?v=rollback5";
import { createMenuState, createRoundState } from "./state.js?v=rollback5";
import { clamp, distance, lerp, normalize } from "./utils.js?v=rollback5";

export class Game {
  constructor(ui) {
    this.ui = ui;
    this.keys = new Set();
    this.state = createMenuState();
  }

  start(mode) {
    this.state = createRoundState(mode);
    this.state.timeLeft = MODE_CONFIG[mode].roundTime;
    this.ui.menuOverlay.classList.add("hidden");
    this.ui.resultOverlay.classList.add("hidden");
    this.setStatus(MODE_CONFIG[mode].status);
    this.updateHud();
  }

  backToMenu() {
    this.state = createMenuState();
    this.ui.resultOverlay.classList.add("hidden");
    this.ui.menuOverlay.classList.remove("hidden");
    this.setStatus("Choose a mode to begin.");
    this.updateHud();
  }

  restart() {
    if (this.state.mode) {
      this.start(this.state.mode);
    }
  }

  togglePause() {
    if (this.state.screen !== "playing") return;
    this.state.paused = !this.state.paused;
    this.setStatus(this.state.paused ? "Paused." : MODE_CONFIG[this.state.mode].status);
  }

  setStatus(text) {
    this.ui.statusText.textContent = text;
  }

  setKey(key, pressed) {
    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    if (pressed) {
      this.keys.add(normalizedKey);
    } else {
      this.keys.delete(normalizedKey);
    }
  }

  update(dt) {
    const state = this.state;
    if (state.screen !== "playing" || state.paused) return;

    state.timeLeft = Math.max(0, state.timeLeft - dt);
    if (state.timeLeft <= 0) {
      this.finishRound("Walk timed out", "You did not make it home before time ran out.");
      this.updateHud();
      return;
    }

    const mode = MODE_CONFIG[state.mode];
    const { dog, owner } = state.entities;

    if (mode.playerRole === "dog" || mode.playerRole === "both") {
      this.applyMovement(dog, this.getInputVector("dog"), dt, 1);
    } else {
      this.applyMovement(dog, this.soloAiVector("dog"), dt, 0.82);
    }

    if (mode.playerRole === "owner" || mode.playerRole === "both") {
      this.applyMovement(owner, this.getInputVector("owner"), dt, 1);
    } else {
      this.applyMovement(owner, this.soloAiVector("owner"), dt, 0.78);
    }

    this.applyLeash(dt);

    for (const entity of [dog, owner]) {
      entity.x += entity.vx * dt;
      entity.y += entity.vy * dt;
      this.resolveObstacleEffects(entity, dt);
      this.keepInBounds(entity);
      this.collectPickups(entity);
    }

    this.updateAnger(dt);
    this.updateFx(dt);

    if (this.hasReachedExit() && this.state.screen === "playing") {
      this.evaluateWinner();
    }

    if (state.messageTimer > 0) {
      state.messageTimer -= dt;
    }

    this.updateHud();
  }

  getInputVector(role) {
    let x = 0;
    let y = 0;

    if (role === "dog" && this.state.mode === "twoPlayer") {
      if (this.keys.has("a")) x -= 1;
      if (this.keys.has("d")) x += 1;
      if (this.keys.has("w")) y -= 1;
      if (this.keys.has("s")) y += 1;
    } else {
      const allowWasd = this.state.mode !== "twoPlayer";
      if (allowWasd && this.keys.has("a")) x -= 1;
      if (allowWasd && this.keys.has("d")) x += 1;
      if (allowWasd && this.keys.has("w")) y -= 1;
      if (allowWasd && this.keys.has("s")) y += 1;
      if (this.keys.has("ArrowLeft")) x -= 1;
      if (this.keys.has("ArrowRight")) x += 1;
      if (this.keys.has("ArrowUp")) y -= 1;
      if (this.keys.has("ArrowDown")) y += 1;
    }

    return normalize(x, y);
  }

  soloAiVector(role) {
    const self = this.state.entities[role];
    const other = this.state.entities[role === "dog" ? "owner" : "dog"];
    const separation = distance(self, other);
    if (separation > 132) {
      return normalize(other.x - self.x, other.y - self.y);
    }

    const targetPickup = this.nearestPickup(role, self);
    const progress = this.routeProgressFor(self);
    const routeTarget = this.routePointAtProgress(progress + 0.08);

    if (targetPickup) {
      const pickupVector = normalize(targetPickup.x - self.x, targetPickup.y - self.y);
      const routeVector = normalize(routeTarget.x - self.x, routeTarget.y - self.y);
      const towardGoalWeight =
        role === "owner" ? 0.64 : this.state.mode === "ownerSolo" ? 0.62 : 0.34;
      return normalize(
        pickupVector.x * (1 - towardGoalWeight) + routeVector.x * towardGoalWeight,
        pickupVector.y * (1 - towardGoalWeight) + routeVector.y * towardGoalWeight
      );
    }

    return normalize(routeTarget.x - self.x, routeTarget.y - self.y);
  }

  nearestPickup(side, source) {
    let best = null;
    let bestDistance = Infinity;
    const mode = this.state.mode;

    for (const pickup of this.state.pickups) {
      if (!pickup.active) continue;
      const info = PICKUP_LIBRARY[pickup.type];
      let wantsThisPickup = false;

      if (side === "dog") {
        if (mode === "ownerSolo") {
          wantsThisPickup = pickup.type === "chocolate";
        } else {
          wantsThisPickup = info.side === "dog" && info.score > 0;
        }
      }

      if (side === "owner") {
        wantsThisPickup = info.side === "owner" && info.score > 0;
      }

      if (!wantsThisPickup) continue;
      if (source.lingerTargetId === pickup.id && source.lingerTime > 0) continue;
      const dist = Math.hypot(pickup.x - source.x, pickup.y - source.y);
      if (side === "dog" && mode === "ownerSolo") {
        const ownerProgress = this.routeProgressFor(this.state.entities.owner);
        const dogProgress = this.routeProgressFor(source);
        if (dist > 135) continue;
        if (ownerProgress > dogProgress + 0.05) continue;
      }
      if (side === "owner") {
        if (dist > 110) continue;
        if (this.routeDistanceForPoint(pickup) > 48) continue;
      }
      if (dist < bestDistance) {
        best = pickup;
        bestDistance = dist;
      }
    }

    return best;
  }

  routeProgressFor(entity) {
    let bestProgress = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < ROUTE.length - 1; i += 1) {
      const a = ROUTE[i];
      const b = ROUTE[i + 1];
      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const apx = entity.x - a.x;
      const apy = entity.y - a.y;
      const abLenSq = abx * abx + aby * aby || 1;
      const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
      const px = a.x + abx * t;
      const py = a.y + aby * t;
      const dist = Math.hypot(entity.x - px, entity.y - py);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestProgress = (i + t) / (ROUTE.length - 1);
      }
    }

    return bestProgress;
  }

  routeDistanceForPoint(point) {
    let bestDistance = Infinity;

    for (let i = 0; i < ROUTE.length - 1; i += 1) {
      const a = ROUTE[i];
      const b = ROUTE[i + 1];
      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const apx = point.x - a.x;
      const apy = point.y - a.y;
      const abLenSq = abx * abx + aby * aby || 1;
      const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
      const px = a.x + abx * t;
      const py = a.y + aby * t;
      bestDistance = Math.min(bestDistance, Math.hypot(point.x - px, point.y - py));
    }

    return bestDistance;
  }

  routePointAtProgress(progress) {
    const capped = clamp(progress, 0, 0.9999);
    const totalSegments = ROUTE.length - 1;
    const scaled = capped * totalSegments;
    const index = Math.floor(scaled);
    const localT = scaled - index;
    const a = ROUTE[index];
    const b = ROUTE[index + 1];
    return { x: lerp(a.x, b.x, localT), y: lerp(a.y, b.y, localT) };
  }

  applyMovement(entity, input, dt, intensity = 1) {
    entity.lingerTime = Math.max(0, entity.lingerTime - dt);
    entity.freezeTimer = Math.max(0, entity.freezeTimer - dt);
    if (entity.lingerTime <= 0) {
      entity.lingerTargetId = null;
    }

    if (entity.freezeTimer > 0) {
      const damp = Math.pow(0.00018, dt);
      entity.vx *= damp;
      entity.vy *= damp;
      return;
    }

    const accel = entity.speed * 4.6 * intensity;
    entity.vx += input.x * accel * dt;
    entity.vy += input.y * accel * dt;

    const damp = Math.pow(0.00045, dt);
    entity.vx *= damp;
    entity.vy *= damp;

    if (Math.abs(entity.vx) > 2) {
      entity.facing = entity.vx >= 0 ? 1 : -1;
    }
  }

  applyLeash(dt) {
    const { dog, owner } = this.state.entities;
    const dx = dog.x - owner.x;
    const dy = dog.y - owner.y;
    const dist = Math.hypot(dx, dy) || 1;
    const direction = { x: dx / dist, y: dy / dist };
    const slack = 82;
    const maxDist = 132;
    const stretch = Math.max(0, dist - slack);
    const spring = stretch * 15.5;

    dog.vx -= direction.x * spring * dt;
    dog.vy -= direction.y * spring * dt;
    owner.vx += direction.x * spring * dt;
    owner.vy += direction.y * spring * dt;

    if (dist > maxDist) {
      const overflow = dist - maxDist;
      dog.x -= direction.x * overflow * 0.5;
      dog.y -= direction.y * overflow * 0.5;
      owner.x += direction.x * overflow * 0.5;
      owner.y += direction.y * overflow * 0.5;

      const snap = overflow * 34;
      dog.vx -= direction.x * snap * dt;
      dog.vy -= direction.y * snap * dt;
      owner.vx += direction.x * snap * dt;
      owner.vy += direction.y * snap * dt;
    }
  }

  resolveObstacleEffects(entity, dt) {
    return entity;
  }

  keepInBounds(entity) {
    entity.x = clamp(entity.x, 40, WIDTH - 40);
    entity.y = clamp(entity.y, 40, HEIGHT - 40);
  }

  spawnCollectFx(x, y, color) {
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      this.state.fx.push({
        x,
        y,
        vx: Math.cos(angle) * (60 + Math.random() * 40),
        vy: Math.sin(angle) * (60 + Math.random() * 40),
        life: 0.6 + Math.random() * 0.25,
        color,
      });
    }
  }

  collectPickups(entity) {
    for (const pickup of this.state.pickups) {
      if (!pickup.active) continue;
      const info = PICKUP_LIBRARY[pickup.type];
      if (distance(entity, pickup) > entity.radius + info.radius) continue;
      const mode = this.state.mode;
      const isDogSolo = mode === "dogSolo";
      const isOwnerSolo = mode === "ownerSolo";

      let scoreTarget = null;
      let scoreDelta = 0;
      let ownerDelay = 0;
      let messageLabel = info.label;
      let dogDelay = 0;

      if (mode === "twoPlayer") {
        const isBonusForEntity = info.score > 0 && info.side === entity.role;
        const isPenaltyForEntity = info.score < 0 && info.side === entity.role;
        if (!isBonusForEntity && !isPenaltyForEntity) continue;
        scoreTarget = entity;
        scoreDelta = info.score;
      } else if (isDogSolo) {
        if (entity.role === "dog" && info.side === "dog" && info.score > 0) {
          scoreTarget = this.state.entities.dog;
          scoreDelta = info.score;
          if (pickup.type === "smell") {
            dogDelay = 0.65;
            messageLabel = "Sniff spot";
          }
        } else if (entity.role === "owner" && info.side === "owner" && info.score > 0) {
          scoreTarget = this.state.entities.dog;
          scoreDelta = 0;
          ownerDelay = pickup.type === "chat" ? 1.8 : 1.3;
          messageLabel = `${info.label} stop`;
          pickup.active = false;
        } else {
          continue;
        }
      } else if (isOwnerSolo) {
        if (entity.role === "owner" && info.side === "owner" && info.score > 0) {
          scoreTarget = this.state.entities.owner;
          scoreDelta = info.score;
          pickup.active = false;
        } else if (entity.role === "dog" && pickup.type === "chocolate") {
          scoreTarget = this.state.entities.owner;
          scoreDelta = -Math.abs(PICKUP_LIBRARY.chocolate.score);
        } else {
          continue;
        }
      }

      if (mode === "twoPlayer" || entity.role === "dog") {
        pickup.active = false;
      }
      scoreTarget.score += scoreDelta;
      entity.lingerTargetId = pickup.id;
      entity.lingerTime = entity.role === "owner" ? 4.5 : 3.5;
      if (ownerDelay > 0) {
        entity.freezeTimer = ownerDelay;
        this.state.entities.dog.freezeTimer = Math.max(this.state.entities.dog.freezeTimer, ownerDelay * 0.8);
        this.state.pickupMessage = `Owner stop: ${messageLabel} +${ownerDelay.toFixed(1)}s delay`;
      } else if (dogDelay > 0) {
        entity.freezeTimer = dogDelay;
        this.state.pickupMessage = `${scoreTarget.role === "dog" ? "Dog" : "Owner"}: ${messageLabel} +${scoreDelta} and a quick sniff`;
      } else {
        this.state.pickupMessage = `${scoreTarget.role === "dog" ? "Dog" : "Owner"}: ${messageLabel} ${
          scoreDelta > 0 ? "+" : ""
        }${scoreDelta}`;
      }
      this.state.messageTimer = 1.5;
      this.spawnCollectFx(pickup.x, pickup.y, info.color);

      if (mode !== "twoPlayer") {
        const playerRole = MODE_CONFIG[mode].playerRole;
        if (entity.role === playerRole && scoreDelta > 0) {
          this.state.anger += pickup.type === "smell" ? 0.018 : 0.035;
        } else if (entity.role !== playerRole && scoreDelta < 0) {
          this.state.anger += 0.05;
        } else if (entity.role !== playerRole && scoreDelta > 0) {
          this.state.anger = Math.max(0, this.state.anger - 0.04);
        } else if (ownerDelay > 0) {
          this.state.anger = Math.max(0, this.state.anger - 0.025);
        }
      }
    }
  }

  updateAnger(dt) {
    if (this.state.mode === "twoPlayer") return;

    const playerRole = MODE_CONFIG[this.state.mode].playerRole;
    const player = this.state.entities[playerRole];
    const counterpart = this.state.entities[playerRole === "dog" ? "owner" : "dog"];
    const dist = Math.hypot(player.x - counterpart.x, player.y - counterpart.y);
    const tension = clamp((dist - 82) / 54, 0, 1.5);
    const progressPlayer = this.routeProgressFor(player);
    const progressCounterpart = this.routeProgressFor(counterpart);
    const routeMid = this.routePointAtProgress(progressPlayer);
    const routeOffset = Math.hypot(player.x - routeMid.x, player.y - routeMid.y);
    const progressNow = Math.max(progressPlayer, progressCounterpart);

    if (progressNow <= this.state.lastProgress + 0.002) {
      this.state.stallTime += dt;
    } else {
      this.state.stallTime = Math.max(0, this.state.stallTime - dt * 1.6);
      this.state.lastProgress = progressNow;
    }

    const counterpartLead = progressCounterpart - progressPlayer;
    const leashVector = normalize(counterpart.x - player.x, counterpart.y - player.y);
    const routeTarget = this.routePointAtProgress(progressPlayer + 0.06);
    const routeVector = normalize(routeTarget.x - player.x, routeTarget.y - player.y);
    const disagreement = 1 - Math.max(-1, Math.min(1, leashVector.x * routeVector.x + leashVector.y * routeVector.y));

    let angerDelta = 0;
    angerDelta += tension * 0.095 * dt;
    angerDelta += clamp((routeOffset - 120) / 180, 0, 1) * 0.03 * dt;
    angerDelta += clamp((this.state.stallTime - 4.5) / 4.5, 0, 1) * 0.035 * dt;
    angerDelta += disagreement * 0.022 * dt;
    angerDelta += clamp(counterpartLead - 0.08, 0, 0.35) * 0.05 * dt;
    angerDelta -= progressCounterpart > progressPlayer + 0.02 ? 0.085 * dt : 0.02 * dt;

    this.state.anger = clamp(this.state.anger + angerDelta, 0, 1);
    if (this.state.anger >= 1) {
      const loser = playerRole === "dog" ? "Dog" : "Owner";
      const upset =
        MODE_CONFIG[this.state.mode].angerTarget === "owner" ? "owner anger filled up" : "dog sadness maxed out";
      this.finishRound(`${loser} loses the walk`, `The ${upset} and the walk ended early.`);
    }
  }

  updateFx(dt) {
    this.state.fx = this.state.fx
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx * dt,
        y: particle.y + particle.vy * dt,
        life: particle.life - dt,
        vy: particle.vy * 0.96,
        vx: particle.vx * 0.96,
      }))
      .filter((particle) => particle.life > 0);
  }

  hasReachedExit() {
    const { dog, owner } = this.state.entities;
    const pairCenter = { x: (dog.x + owner.x) / 2, y: (dog.y + owner.y) / 2 };
    return distance(pairCenter, EXIT) < EXIT.radius + 22 && distance(dog, owner) < 108;
  }

  evaluateWinner() {
    if (this.state.mode !== "dogSolo") {
      this.state.entities.owner.score += 100;
    }
    if (this.state.mode === "dogSolo") {
      this.state.entities.dog.score += 100;
    }

    if (this.state.mode === "twoPlayer") {
      if (this.state.entities.dog.score > this.state.entities.owner.score) {
        this.finishRound("Dog wins", "The dog cleaned up on the bright scenic side of the walk.");
      } else if (this.state.entities.owner.score > this.state.entities.dog.score) {
        this.finishRound("Owner wins", "The owner made it home with the tidier route bonus.");
      } else {
        this.finishRound("Tie game", "Both sides made it home equally smug.");
      }
      return;
    }

    const playerRole = MODE_CONFIG[this.state.mode].playerRole;
    this.finishRound(
      `${playerRole === "dog" ? "Dog" : "Owner"} made it home`,
      "You reached the destination before the leash drama boiled over."
    );
  }

  finishRound(title, reason) {
    this.state.screen = "result";
    this.ui.resultTitle.textContent = title;
    this.ui.resultReason.textContent = reason;
    this.ui.resultDogScore.textContent = Math.round(this.state.entities.dog.score);
    this.ui.resultOwnerScore.textContent = Math.round(this.state.entities.owner.score);
    this.ui.resultDogBlock.style.display = this.state.mode === "ownerSolo" ? "none" : "";
    this.ui.resultOwnerBlock.style.display = this.state.mode === "dogSolo" ? "none" : "";
    this.ui.resultDogLabel.textContent = this.state.mode === "twoPlayer" ? "Dog final" : "Dog score";
    this.ui.resultOwnerLabel.textContent = this.state.mode === "twoPlayer" ? "Owner final" : "Owner score";
    this.ui.resultOverlay.classList.remove("hidden");
    this.setStatus(reason);
  }

  updateHud() {
    const mode = this.state.mode ? MODE_CONFIG[this.state.mode] : null;
    this.ui.modeLabel.textContent = mode ? mode.name : "Menu";
    if (this.state.entities) {
      this.ui.dogScore.textContent =
        this.state.mode === "ownerSolo" ? "—" : Math.round(this.state.entities.dog.score);
      this.ui.ownerScore.textContent =
        this.state.mode === "dogSolo" ? "—" : Math.round(this.state.entities.owner.score);
    } else {
      this.ui.dogScore.textContent = "0";
      this.ui.ownerScore.textContent = "0";
    }
    this.ui.timeLeft.textContent = this.state.mode ? formatTime(this.state.timeLeft) : "0:00";

    if (mode && mode.angerTarget) {
      this.ui.angerLabel.textContent = mode.angerTarget === "owner" ? "Owner anger" : "Dog sadness";
      this.ui.angerFill.style.width = `${Math.round(this.state.anger * 100)}%`;
      this.ui.angerFill.parentElement.style.opacity = "1";
    } else {
      this.ui.angerLabel.textContent = "No anger";
      this.ui.angerFill.style.width = "0%";
      this.ui.angerFill.parentElement.style.opacity = "0.35";
    }
  }
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
