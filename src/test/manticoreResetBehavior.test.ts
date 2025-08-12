import { beforeEach, describe, expect, it } from "vitest";
import { MANTICORE, _getMobs, _setSelected, place, remove, reset, setMode, step, setFromWaveStart } from "../lineOfSight";

describe("Manticore reset behavior", () => {
  beforeEach(() => {
    remove();
    setFromWaveStart(false);
  });

  it("'u' manticore inheriting from 'ur' manticore should reset back to 'u'", () => {
    // Place player at position where both manticores will have LOS
    _setSelected([16, 18], 0);
    
    // Place an uncharged-but-known 'ur' manticore (within 15 range)
    _setSelected([10, 19], MANTICORE);
    setMode(MANTICORE, "ur");
    place();
    
    // Place an unknown 'u' manticore (within 15 range)
    _setSelected([20, 15], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Reset player position after placing NPCs (since place() resets mode to 0 which affects selected position)
    _setSelected([16, 18], 0);
    
    // Step to trigger charging
    step();
    
    let mobs = _getMobs();
    const urManticore = mobs[0];
    const uManticore = mobs[1];
    
    // Both should have 'r' style (u inherited from ur)
    expect(urManticore[6]).toBe("r");
    expect(uManticore[6]).toBe("r");
    
    // ur should keep originalExtra as 'ur', u should keep originalExtra as 'u'
    expect(urManticore[7]).toBe("ur");
    expect(uManticore[7]).toBe("u");
    
    // Reset
    reset();
    
    mobs = _getMobs();
    const urManticoreAfterReset = mobs[0];
    const uManticoreAfterReset = mobs[1];
    
    // ur manticore should reset to uncharged with extra='ur'
    expect(urManticoreAfterReset[6]).toBe("ur");
    expect(urManticoreAfterReset[7]).toBe("ur");
    
    // u manticore should reset back to unknown
    expect(uManticoreAfterReset[6]).toBe("u");
    expect(uManticoreAfterReset[7]).toBe("u");
  });

  it("'u' manticore inheriting from charged 'r' manticore should reset back to 'u'", () => {
    // Place player at position where both manticores will have LOS
    _setSelected([16, 18], 0);
    
    // Place a charged 'r' manticore (within 15 range)
    _setSelected([10, 19], MANTICORE);
    setMode(MANTICORE, "r");
    place();
    
    // Place an unknown 'u' manticore (within 15 range) 
    _setSelected([20, 15], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Reset player position after placing NPCs
    _setSelected([16, 18], 0);
    
    // Step to trigger charging (u will inherit from charged r)
    step();
    
    let mobs = _getMobs();
    const rManticore = mobs[0];
    const uManticore = mobs[1];
    
    // Both should have 'r' style
    expect(rManticore[6]).toBe("r");
    expect(uManticore[6]).toBe("r");
    
    // r should keep originalExtra as 'r', u should keep originalExtra as 'u'
    expect(rManticore[7]).toBe("r");
    expect(uManticore[7]).toBe("u");
    
    // Reset
    reset();
    
    mobs = _getMobs();
    const rManticoreAfterReset = mobs[0];
    const uManticoreAfterReset = mobs[1];
    
    // r manticore should reset to charged with extra='r'
    expect(rManticoreAfterReset[6]).toBe("r");
    expect(rManticoreAfterReset[7]).toBe("r");
    
    // u manticore should reset back to unknown
    expect(uManticoreAfterReset[6]).toBe("u");
    expect(uManticoreAfterReset[7]).toBe("u");
  });

  it("'u' manticore choosing randomly (no inheritance) should become 'ur' or 'um' permanently", () => {
    // Place player at position where manticore will have LOS
    _setSelected([16, 18], 0);
    
    // Place only an unknown 'u' manticore (no others to inherit from)
    _setSelected([20, 15], MANTICORE);
    setMode(MANTICORE, "u");
    place();
    
    // Reset player position after placing NPC
    _setSelected([16, 18], 0);
    
    // Step to trigger charging
    step();
    
    let mobs = _getMobs();
    const manticore = mobs[0];
    
    // Should have chosen 'r' or 'm' randomly
    expect(['r', 'm']).toContain(manticore[6]);
    
    // originalExtra should have been updated to 'ur' or 'um'
    const expectedOriginal = manticore[6] === 'r' ? 'ur' : 'um';
    expect(manticore[7]).toBe(expectedOriginal);
    
    // Reset
    reset();
    
    mobs = _getMobs();
    const manticoreAfterReset = mobs[0];
    
    // Should maintain the chosen style (now as uncharged version)
    expect(manticoreAfterReset[6]).toBe(expectedOriginal);
    expect(manticoreAfterReset[7]).toBe(expectedOriginal);
  });
});