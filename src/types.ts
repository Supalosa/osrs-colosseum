export type Coordinates = [number, number];

export type MobX = number;
export type MobY = number;
export type MobType = number;
export type MobSpawnX = number;
export type MobSpawnY = number;
export type MobCooldown = number;
export type MobExtra = "r" | "m" | "u" | "ur" | "um" | null;
export type MobCharged = boolean;
export type MobChargingTicks = number;
export type MobOriginalExtra = MobExtra; // Stores the original extra value for manticores
export type Mob = [
  MobX,
  MobY,
  MobType,
  MobSpawnX,
  MobSpawnY,
  MobCooldown,
  MobExtra,
  MobCharged?,
  MobChargingTicks?,
  MobOriginalExtra?
];
export type MobSpec = [MobSpawnX, MobSpawnY, MobType, MobExtra];

// each entry corresponds to a value for the mob in that position.
// first 8 bits = mob type
// next 8 bits = mob special attack (manticore r/m)
// next 8 bits = mob x
// next 8 bits = mob y
export type TapeEntry = number[];
