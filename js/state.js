import { PICKUP_LAYOUT, START } from "./data.js?v=rollback5";

export function createMenuState() {
  return {
    screen: "menu",
    paused: false,
    mode: null,
    entities: null,
    pickups: [],
    anger: 0,
    stallTime: 0,
    messageTimer: 0,
    pickupMessage: "",
    fx: [],
    lastProgress: 0,
    lastMode: null,
  };
}

export function freshEntity(role, x, y) {
  return {
    role,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: role === "dog" ? 18 : 20,
    speed: role === "dog" ? 210 : 190,
    score: 0,
    slowTimer: 0,
    facing: 1,
    lingerTargetId: null,
    lingerTime: 0,
    freezeTimer: 0,
  };
}

export function createPickups() {
  return PICKUP_LAYOUT.map(([type, x, y], index) => ({
    id: `${type}-${index}`,
    type,
    x,
    y,
    active: true,
    pulse: Math.random() * Math.PI * 2,
  }));
}

export function createRoundState(mode) {
  return {
    screen: "playing",
    paused: false,
    mode,
    entities: {
      dog: freshEntity("dog", START.x - 24, START.y + 18),
      owner: freshEntity("owner", START.x + 24, START.y - 8),
    },
    pickups: createPickups(),
    anger: 0,
    stallTime: 0,
    messageTimer: 0,
    pickupMessage: "",
    fx: [],
    lastProgress: 0,
    lastMode: mode,
    timeLeft: 0,
  };
}
