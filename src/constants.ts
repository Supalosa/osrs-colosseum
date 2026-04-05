import { Coordinates } from "./types";


export const NPC_TYPES = {
  PLAYER: 0,
  SERPENT_SHAMAN: 1,
  JAVELIN_COLOSSUS: 2,
  JAGUAR_WARRIOR: 3,
  MANTICORE: 4,
  MINOTAUR: 5,
  SHOCKWAVE_COLOSSUS: 6,
  REINFORCEMENT_SHAMAN: 7,
}
export type NpcType = typeof NPC_TYPES[keyof typeof NPC_TYPES];
export const NPC_TYPE_TO_NAME: Record<string, string> = {};
Object.entries(NPC_TYPES).forEach(([name, id]) => {
  NPC_TYPE_TO_NAME[id] = name;
});

export const _SHAMAN = { id: 1, size: 1, range: 10, cd: 5, img: "serpent_shaman.png", color: "cyan" };
// note: 'id' is a typical ingame npc id, which is different from the type index for legacy reasons (e.g. to not
// break old replay URLs)
export const NPC_INFO = {
  [NPC_TYPES.PLAYER]: { id: -1, size: 1, range: 10, cd: 0, img: "player.png", color: "red" },
  [NPC_TYPES.SERPENT_SHAMAN]: _SHAMAN,
  [NPC_TYPES.JAVELIN_COLOSSUS]: { id: 2, size: 3, range: 15, cd: 5, img: "javelin_colossus.png", color: "lime" },
  [NPC_TYPES.JAGUAR_WARRIOR]: { id: 4, size: 2, range: 1, cd: 5, img: "jaguar_warrior.png", color: "orange" },
  [NPC_TYPES.MANTICORE]: { id: 0, size: 3, range: 15, cd: 10, img: "manticore.png", color: "purple" },
  [NPC_TYPES.MINOTAUR]: { id: 5, size: 3, range: 1, cd: 5, img: "minotaur.png", color: "brown" },
  [NPC_TYPES.SHOCKWAVE_COLOSSUS]: { id: 3, size: 3, range: 15, cd: 5, img: "shockwave_colossus.png", color: "blue" },
  [NPC_TYPES.REINFORCEMENT_SHAMAN]: { ..._SHAMAN, id: 6 },
};

export const MODE_PLAYER = 0;

export const MANTICORE = NPC_TYPES.MANTICORE;
export const MANTICORE_ATTACKS = ["lime", "blue", "red"];

// Base patterns for manticore attacks
// values are indexes into MANTICORE_ATTACKS (0=range/lime, 1=mage/blue, 2=melee/red)
export const BASE_MANTICORE_PATTERNS: { [patternName: string]: number[] } = {
  // Standard patterns
  "r": [0, 1, 2],  // range-mage-melee
  "m": [1, 0, 2],  // mage-range-melee
  // MM3 patterns  
  "Mrm": [2, 0, 1], // melee-range-mage
  "Mmr": [2, 1, 0], // melee-mage-range
  "rMm": [0, 2, 1], // range-melee-mage
  "mMr": [1, 2, 0], // mage-melee-range
};

// Build full pattern map including uncharged versions
export const MANTICORE_PATTERNS: { [patternName: string]: number[] } = {
  ...BASE_MANTICORE_PATTERNS,
  // Uncharged versions have the same pattern as charged
  ...Object.fromEntries(
    Object.entries(BASE_MANTICORE_PATTERNS).map(([key, value]) => [`u${key}`, value])
  ),
};
export const MANTICORE_DELAY = 5;
export const MANTICORE_CHARGE_TIME = 10;
export const MM3_PATTERNS = ["r", "m", "Mrm", "Mmr", "rMm", "mMr"];
export const STANDARD_PATTERNS = ["r", "m"];

export const MINOTAUR = 5;
export const MINOTAUR_HEAL_RANGE = 7;
export const MINOTAUR_HEAL_COLOR = "purple";

export const DELAY_FIRST_ATTACK_TICKS = 3;

// each entry represents the spans across the x axis for that a corresponding y value
export const blockedTileRanges: Coordinates[][] = [
  [
    [0, 13],
    [15, 19], // door
    [21, 34],
  ],
  [
    [0, 9],
    [25, 34],
  ], // 1
  [
    [0, 7],
    [27, 34],
  ], // 2
  [
    [0, 6],
    [29, 34],
  ], // 3
  [
    [0, 5],
    [29, 34],
  ], // 4
  [
    [0, 3],
    [31, 34],
  ], // 5
  [
    [0, 3],
    [31, 34],
  ], // 6
  [
    [0, 2],
    [32, 34],
  ], // 7
  [
    [0, 2],
    [32, 34],
  ], // 8
  [
    [0, 1],
    [33, 34],
  ], // 9
  [
    [0, 1],
    [33, 34],
  ], // 10
  [
    [0, 1],
    [32, 34],
  ],
  [
    [0, 1],
    [31, 34],
  ],
  [[31, 34]],
  [[31, 34]],
  [
    [0, 1],
    [31, 34],
  ],
  [
    [0, 1],
    [31, 34],
  ],
  [
    [0, 1],
    [31, 34],
  ],
  [
    [0, 1],
    [31, 34],
  ],

  [[31, 34]],
  [[31, 34]],

  [
    [0, 1],
    [31, 34],
  ],
  [
    [0, 1],
    [32, 34],
  ],
  [
    [0, 1],
    [33, 34],
  ],
  [
    [0, 1],
    [33, 34],
  ],

  [
    [0, 2],
    [32, 34],
  ],
  [
    [0, 2],
    [32, 34],
  ],

  [
    [0, 3],
    [31, 34],
  ],
  [
    [0, 3],
    [31, 34],
  ],

  [
    [0, 5],
    [29, 34],
  ],
  [
    [0, 5],
    [29, 34],
  ],

  [
    [0, 7],
    [27, 34],
  ],

  [
    [0, 9],
    [25, 34],
  ],

  [
    [0, 13],
    [15, 19], // door
    [21, 34],
  ],
];
