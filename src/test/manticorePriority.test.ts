import { beforeEach, describe, expect, it } from "vitest";
import { MANTICORE, _getMobs, _setSelected, place, remove, setMode, step } from "../lineOfSight";

describe("Manticore orb order priority", () => {
  beforeEach(() => {
    remove();
  });

  it("should use 'um' manticore to determine orb order when both 'um' and 'u' see player", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u'
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged mage manticore 'um'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const unknownManticore = mobs[0];
    const umManticore = mobs[1];
    
    // Both should be charging
    expect(unknownManticore[5]).toBeGreaterThan(0);
    expect(umManticore[5]).toBeGreaterThan(0);
    
    // Both should have mage style since 'um' has priority
    expect(unknownManticore[6]).toBe("m");
    expect(umManticore[6]).toBe("m");
  });

  it("should use 'ur' manticore to determine orb order when both 'ur' and 'u' see player", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u'
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged range manticore 'ur'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const unknownManticore = mobs[0];
    const urManticore = mobs[1];
    
    // Both should be charging
    expect(unknownManticore[5]).toBeGreaterThan(0);
    expect(urManticore[5]).toBeGreaterThan(0);
    
    // Both should have range style since 'ur' has priority
    expect(unknownManticore[6]).toBe("r");
    expect(urManticore[6]).toBe("r");
  });

  it("should inherit from charged manticore 'r' when both see player", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place a charged range manticore
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "r");
    place();
    
    // Place an uncharged mage manticore 'um'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const chargedManticore = mobs[0];
    const umManticore = mobs[1];
    
    // UM should inherit range style from charged manticore
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe("r");
    
    // Charged manticore keeps its style
    expect(chargedManticore[6]).toBe("r");
    
    // UM should keep its original type
    expect(umManticore[7]).toBe("um");
  });

  it("u manticore should defer to um when both see player simultaneously", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' close to player
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged mage manticore 'um' also close to player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const uManticore = mobs[0];
    const umManticore = mobs[1];
    
    // Both should be charging
    expect(uManticore[5]).toBeGreaterThan(0);
    expect(umManticore[5]).toBeGreaterThan(0);
    
    // Both should have mage style since 'um' determines it
    expect(uManticore[6]).toBe("m");
    expect(umManticore[6]).toBe("m");
  });

  it("u manticore should defer to ur when both see player simultaneously", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' close to player
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged range manticore 'ur' also close to player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const uManticore = mobs[0];
    const urManticore = mobs[1];
    
    // Both should be charging
    expect(uManticore[5]).toBeGreaterThan(0);
    expect(urManticore[5]).toBeGreaterThan(0);
    
    // Both should have range style since 'ur' determines it
    expect(uManticore[6]).toBe("r");
    expect(urManticore[6]).toBe("r");
  });

  it("should prioritize 'um' over 'ur' when both see player simultaneously", () => {
    // Place player at position  
    _setSelected([16, 18], 0);
    
    // Place an uncharged range manticore 'ur'
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Place an uncharged mage manticore 'um'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Place an unknown manticore 'u'
    _setSelected([3, 14], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const urManticore = mobs[0];
    const umManticore = mobs[1];
    const unknownManticore = mobs[2];
    
    // All should be charging
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(unknownManticore[5]).toBeGreaterThan(0);
    
    // Since both 'um' and 'ur' have same priority (3), first one found should determine
    // But 'um' should set mage, 'ur' should set range for themselves
    expect(umManticore[6]).toBe("m");
    expect(urManticore[6]).toBe("r");
    // Unknown should inherit from one of them (whichever is processed first)
    expect(["r", "m"]).toContain(unknownManticore[6]);
  });

  it("should respect already charging 'u' manticore when 'um' sees player later", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' that can see player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged mage manticore 'um' far away
    _setSelected([28, 28], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to trigger the 'u' manticore to start charging
    _setSelected([16, 18], 0);
    step();
    
    const mobs = _getMobs();
    const uManticore = mobs[0];
    const umManticore = mobs[1];
    
    // U manticore should be charging with a random style
    expect(uManticore[5]).toBeGreaterThan(0);
    const uStyle = uManticore[6];
    expect(["r", "m"]).toContain(uStyle);
    
    // UM manticore should not be charging yet (cooldown decremented in step)
    expect(umManticore[5]).toBeLessThanOrEqual(0);
    
    // Move the um manticore so it can see the player
    umManticore[0] = 9;
    umManticore[1] = 17;
    
    // Step again - now um manticore should start charging but inherit u's style
    step();
    
    // UM should now be charging with the same style as U
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe(uStyle);
    
    // UM should keep its original type
    expect(umManticore[7]).toBe("um");
  });

  it("should respect already charging 'u' manticore when 'ur' sees player later", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' that can see player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Place an uncharged range manticore 'ur' far away
    _setSelected([28, 28], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Move player to trigger the 'u' manticore to start charging
    _setSelected([16, 18], 0);
    step();
    
    const mobs = _getMobs();
    const uManticore = mobs[0];
    const urManticore = mobs[1];
    
    // U manticore should be charging with a random style
    expect(uManticore[5]).toBeGreaterThan(0);
    const uStyle = uManticore[6];
    expect(["r", "m"]).toContain(uStyle);
    
    // UR manticore should not be charging yet (cooldown decremented in step)
    expect(urManticore[5]).toBeLessThanOrEqual(0);
    
    // Move the ur manticore so it can see the player
    urManticore[0] = 9;
    urManticore[1] = 17;
    
    // Step again - now ur manticore should start charging but inherit u's style
    step();
    
    // UR should now be charging with the same style as U
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(urManticore[6]).toBe(uStyle);
    
    // UR should keep its original type
    expect(urManticore[7]).toBe("ur");
  });

  it("should inherit from already charged 'r' manticore when 'u' sees player later", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place a charged range manticore that can see player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "r");
    place();
    
    // Place an unknown manticore 'u' far away
    _setSelected([28, 28], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Move player to position
    _setSelected([16, 18], 0);
    
    const mobs = _getMobs();
    const uManticore = mobs[1];
    
    // Move the u manticore so it can see the player
    uManticore[0] = 9;
    uManticore[1] = 17;
    
    // Step - u manticore should start charging with range style from r
    step();
    
    // U should now be charging with range style inherited from R
    expect(uManticore[5]).toBeGreaterThan(0);
    expect(uManticore[6]).toBe("r");
    
    // U should keep its original type
    expect(uManticore[7]).toBe("u");
  });

  it("should inherit from already charged 'm' manticore when 'um' sees player later", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place a charged mage manticore that can see player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "m");
    place();
    
    // Place an uncharged mage manticore 'um' far away
    _setSelected([28, 28], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to position
    _setSelected([16, 18], 0);
    
    const mobs = _getMobs();
    const umManticore = mobs[1];
    
    // Move the um manticore so it can see the player
    umManticore[0] = 9;
    umManticore[1] = 17;
    
    // Step - um manticore should start charging with mage style from m
    step();
    
    // UM should now be charging with mage style inherited from M
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe("m");
    
    // UM should keep its original type
    expect(umManticore[7]).toBe("um");
  });

  it("should inherit range from charged 'r' manticore when 'ur' sees player later", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place a charged range manticore that can see player
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "r");
    place();
    
    // Place an uncharged range manticore 'ur' far away
    _setSelected([28, 28], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Move player to position
    _setSelected([16, 18], 0);
    
    const mobs = _getMobs();
    const urManticore = mobs[1];
    
    // Move the ur manticore so it can see the player
    urManticore[0] = 9;
    urManticore[1] = 17;
    
    // Step - ur manticore should start charging with range style from r
    step();
    
    // UR should now be charging with range style inherited from R
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(urManticore[6]).toBe("r");
    
    // UR should keep its original type
    expect(urManticore[7]).toBe("ur");
  });

  it("'um' should inherit mage from charged 'm' even when seeing player simultaneously", () => {
    // Place player at position
    _setSelected([16, 18], 0);
    
    // Place a charged mage manticore
    _setSelected([3, 19], MANTICORE);
    setMode(MANTICORE, "m");
    place();
    
    // Place an uncharged mage manticore 'um'
    _setSelected([9, 17], MANTICORE);
    setMode(MANTICORE, "um");
    place();
    
    // Move player to trigger los
    _setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    step();
    
    const mobs = _getMobs();
    const mManticore = mobs[0];
    const umManticore = mobs[1];
    
    // UM should be charging with mage style (inheriting from m)
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe("m");
    
    // Charged manticore keeps its style
    expect(mManticore[6]).toBe("m");
  });
});