import { beforeEach, describe, expect, it } from "vitest";
import { MANTICORE, _getMobs, _setSelected, place, remove, setMode, step } from "../lineOfSight";

describe("Manticore synchronization tests", () => {
  beforeEach(() => {
    remove();
  });

  it("two 'u' manticores gaining los simultaneously should charge with the same orb order", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place first unknown manticore 'u'
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place second unknown manticore 'u'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const firstManticore = mobs[0];
    const secondManticore = mobs[1];
    
    // Both should be charging
    expect(firstManticore[8]).toBeGreaterThan(0);
    expect(secondManticore[8]).toBeGreaterThan(0);
    
    // Both should have the SAME style (either both 'r' or both 'm')
    expect(firstManticore[6]).toBe(secondManticore[6]);
    expect(['r', 'm']).toContain(firstManticore[6]);
  });

  it("three 'u' manticores gaining los simultaneously should all charge with the same orb order", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place first unknown manticore 'u'
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place second unknown manticore 'u'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place third unknown manticore 'u'
    _setSelected([15, 25], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const firstManticore = mobs[0];
    const secondManticore = mobs[1];
    const thirdManticore = mobs[2];
    
    // All should be charging
    expect(firstManticore[8]).toBeGreaterThan(0);
    expect(secondManticore[8]).toBeGreaterThan(0);
    expect(thirdManticore[8]).toBeGreaterThan(0);
    
    // All should have the SAME style
    expect(firstManticore[6]).toBe(secondManticore[6]);
    expect(secondManticore[6]).toBe(thirdManticore[6]);
    expect(['r', 'm']).toContain(firstManticore[6]);
  });
});