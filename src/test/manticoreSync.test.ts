import { beforeEach, describe, expect, it } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { MANTICORE } from "../constants";

describe("Manticore synchronization tests", () => {
  let los: LineOfSight;

  beforeEach(() => {
    los = new LineOfSight();
  });

  it("two 'u' manticores gaining los simultaneously should charge with the same orb order", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place first unknown manticore 'u'
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place second unknown manticore 'u'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
    const firstManticore = mobs[0];
    const secondManticore = mobs[1];
    
    // Both should be charging
    expect(firstManticore[5]).toBeGreaterThan(0);
    expect(secondManticore[5]).toBeGreaterThan(0);
    
    // Both should have the SAME style (either both 'r' or both 'm')
    expect(firstManticore[6]).toBe(secondManticore[6]);
    expect(['r', 'm']).toContain(firstManticore[6]);
  });
});