import { beforeEach, describe, expect, it } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { MANTICORE } from "../constants";

describe("Manticore orb order priority", () => {
  let los: LineOfSight;
  beforeEach(() => {
    los = new LineOfSight();
  });

  it("should use 'um' manticore to determine orb order when both 'um' and 'u' see player", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u'
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged mage manticore 'um'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
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
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u'
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged range manticore 'ur'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "ur");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
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
    los._setSelected([16, 18], 0);
    
    // Place a charged range manticore
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "r");
    los.place();
    
    // Place an uncharged mage manticore 'um'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
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
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' close to player
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged mage manticore 'um' also close to player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
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
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' close to player
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged range manticore 'ur' also close to player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "ur");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
    const uManticore = mobs[0];
    const urManticore = mobs[1];
    
    // Both should be charging
    expect(uManticore[5]).toBeGreaterThan(0);
    expect(urManticore[5]).toBeGreaterThan(0);
    
    // Both should have range style since 'ur' determines it
    expect(uManticore[6]).toBe("r");
    expect(urManticore[6]).toBe("r");
  });

  it("should randomly select between 'um' and 'ur' styles when both see player simultaneously", () => {
    // Place player at position  
    los._setSelected([16, 18], 0);
    
    // Place an uncharged range manticore 'ur'
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "ur");
    los.place();
    
    // Place an uncharged mage manticore 'um'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
    const urManticore = mobs[0];
    const umManticore = mobs[1];
    
    // Both should be charging
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(umManticore[5]).toBeGreaterThan(0);
    
    // When both um and ur see player simultaneously, it randomly picks one style for all
    // Both should have the same style (either both 'm' or both 'r')
    const style = umManticore[6];
    expect(["r", "m"]).toContain(style);
    expect(urManticore[6]).toBe(style);
  });

  it("should respect already charging 'u' manticore when 'um' sees player later", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' that can see player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged mage manticore 'um' far away
    los._setSelected([28, 28], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger the 'u' manticore to start charging
    los._setSelected([16, 18], 0);
    los.step();
    
    const mobs = los._getMobs();
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
    los.step();
    
    // UM should now be charging with the same style as U
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe(uStyle);
    
    // UM should keep its original type
    expect(umManticore[7]).toBe("um");
  });

  it("should respect already charging 'u' manticore when 'ur' sees player later", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place an unknown manticore 'u' that can see player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Place an uncharged range manticore 'ur' far away
    los._setSelected([28, 28], MANTICORE);
    los.setMode(MANTICORE, "ur");
    los.place();
    
    // Move player to trigger the 'u' manticore to start charging
    los._setSelected([16, 18], 0);
    los.step();
    
    const mobs = los._getMobs();
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
    los.step();
    
    // UR should now be charging with the same style as U
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(urManticore[6]).toBe(uStyle);
    
    // UR should keep its original type
    expect(urManticore[7]).toBe("ur");
  });

  it("should inherit from already charged 'r' manticore when 'u' sees player later", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place a charged range manticore that can see player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "r");
    los.place();
    
    // Place an unknown manticore 'u' far away
    los._setSelected([28, 28], MANTICORE);
    los.setMode(MANTICORE, "u");
    los.place();
    
    // Move player to position
    los._setSelected([16, 18], 0);
    
    const mobs = los._getMobs();
    const uManticore = mobs[1];
    
    // Move the u manticore so it can see the player
    uManticore[0] = 9;
    uManticore[1] = 17;
    
    // Step - u manticore should start charging with range style from r
    los.step();
    
    // U should now be charging with range style inherited from R
    expect(uManticore[5]).toBeGreaterThan(0);
    expect(uManticore[6]).toBe("r");
    
    // U should keep its original type
    expect(uManticore[7]).toBe("u");
  });

  it("should inherit from already charged 'm' manticore when 'um' sees player later", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place a charged mage manticore that can see player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "m");
    los.place();
    
    // Place an uncharged mage manticore 'um' far away
    los._setSelected([28, 28], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to position
    los._setSelected([16, 18], 0);
    
    const mobs = los._getMobs();
    const umManticore = mobs[1];
    
    // Move the um manticore so it can see the player
    umManticore[0] = 9;
    umManticore[1] = 17;
    
    // Step - um manticore should start charging with mage style from m
    los.step();
    
    // UM should now be charging with mage style inherited from M
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe("m");
    
    // UM should keep its original type
    expect(umManticore[7]).toBe("um");
  });

  it("should inherit range from charged 'r' manticore when 'ur' sees player later", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place a charged range manticore that can see player
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "r");
    los.place();
    
    // Place an uncharged range manticore 'ur' far away
    los._setSelected([28, 28], MANTICORE);
    los.setMode(MANTICORE, "ur");
    los.place();
    
    // Move player to position
    los._setSelected([16, 18], 0);
    
    const mobs = los._getMobs();
    const urManticore = mobs[1];
    
    // Move the ur manticore so it can see the player
    urManticore[0] = 9;
    urManticore[1] = 17;
    
    // Step - ur manticore should start charging with range style from r
    los.step();
    
    // UR should now be charging with range style inherited from R
    expect(urManticore[5]).toBeGreaterThan(0);
    expect(urManticore[6]).toBe("r");
    
    // UR should keep its original type
    expect(urManticore[7]).toBe("ur");
  });

  it("'um' should inherit mage from charged 'm' even when seeing player simultaneously", () => {
    // Place player at position
    los._setSelected([16, 18], 0);
    
    // Place a charged mage manticore
    los._setSelected([3, 19], MANTICORE);
    los.setMode(MANTICORE, "m");
    los.place();
    
    // Place an uncharged mage manticore 'um'
    los._setSelected([9, 17], MANTICORE);
    los.setMode(MANTICORE, "um");
    los.place();
    
    // Move player to trigger los
    los._setSelected([16, 18], 0);
    
    // Step forward to trigger charging
    los.step();
    
    const mobs = los._getMobs();
    const mManticore = mobs[0];
    const umManticore = mobs[1];
    
    // UM should be charging with mage style (inheriting from m)
    expect(umManticore[5]).toBeGreaterThan(0);
    expect(umManticore[6]).toBe("m");
    
    // Charged manticore keeps its style
    expect(mManticore[6]).toBe("m");
  });
});