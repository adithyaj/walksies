export const WIDTH = 960;
export const HEIGHT = 640;

export const START = { x: 96, y: 520 };
export const EXIT = { x: 860, y: 112, radius: 38 };

export const ROUTE = [
  { x: 96, y: 520 },
  { x: 146, y: 576 },
  { x: 242, y: 562 },
  { x: 314, y: 500 },
  { x: 336, y: 412 },
  { x: 258, y: 344 },
  { x: 150, y: 270 },
  { x: 124, y: 194 },
  { x: 208, y: 136 },
  { x: 334, y: 166 },
  { x: 432, y: 246 },
  { x: 468, y: 344 },
  { x: 428, y: 440 },
  { x: 516, y: 518 },
  { x: 642, y: 534 },
  { x: 766, y: 488 },
  { x: 840, y: 406 },
  { x: 810, y: 320 },
  { x: 710, y: 252 },
  { x: 616, y: 186 },
  { x: 860, y: 112 },
];

export const PICKUP_LIBRARY = {
  smell: {
    label: "Sniff Spot",
    color: "#8cd93f",
    glow: "#e8ff9f",
    radius: 18,
    side: "dog",
    score: 14,
    icon: "smell",
  },
  bone: {
    label: "Bone",
    color: "#fff3cf",
    glow: "#ffffff",
    radius: 16,
    side: "dog",
    score: 24,
    icon: "bone",
  },
  dogpal: {
    label: "Dog Pal",
    color: "#ff9b55",
    glow: "#ffd3b3",
    radius: 19,
    side: "dog",
    score: 34,
    icon: "dogpal",
  },
  chocolate: {
    label: "Chocolate",
    color: "#8f5338",
    glow: "#d29b7e",
    radius: 16,
    side: "dog",
    score: -28,
    icon: "chocolate",
  },
  cash: {
    label: "Cash",
    color: "#46d686",
    glow: "#c8ffd7",
    radius: 16,
    side: "owner",
    score: 18,
    icon: "cash",
  },
  chat: {
    label: "Neighbor Chat",
    color: "#6d8cff",
    glow: "#dfe5ff",
    radius: 19,
    side: "owner",
    score: 28,
    icon: "chat",
  },
  distraction: {
    label: "Sniff Detour",
    color: "#ff6f8f",
    glow: "#ffd2de",
    radius: 17,
    side: "owner",
    score: -18,
    icon: "paw",
  },
};

export const OBSTACLES = [];

export const PICKUP_LAYOUT = [
  ["smell", 118, 414],
  ["cash", 214, 566],
  ["bone", 280, 472],
  ["chat", 184, 228],
  ["dogpal", 292, 128],
  ["distraction", 388, 310],
  ["cash", 472, 158],
  ["smell", 592, 350],
  ["chocolate", 568, 520],
  ["bone", 692, 488],
  ["chat", 802, 382],
  ["cash", 740, 248],
  ["dogpal", 870, 224],
  ["smell", 690, 76],
];

export const MODE_CONFIG = {
  dogSolo: {
    name: "Dog Solo",
    playerRole: "dog",
    angerTarget: "owner",
    status: "Sniff the bright scenic route, but don't drag your human into a meltdown.",
    roundTime: 62,
  },
  ownerSolo: {
    name: "Owner Solo",
    playerRole: "owner",
    angerTarget: "dog",
    status: "Collect cheerful neighborhood goodies and keep your dog from getting gloomy.",
    roundTime: 62,
  },
  twoPlayer: {
    name: "Two Player",
    playerRole: "both",
    angerTarget: null,
    status: "Owner uses arrow keys. Dog uses WASD. Tug, collect, and race home.",
    roundTime: 68,
  },
};
