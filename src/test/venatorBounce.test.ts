import { describe, expect, test } from "vitest";
import { canBounce } from "../venator";

// https://docs.google.com/spreadsheets/d/e/2PACX-1vSN8AyqTbbBAuazJBoqlCw3EuG7_nuW4YVyQDtl6cNlisc1OQj7RAE7qZSrR9YPOl_fYv3-WnGoRIFb/pubhtml
describe("venator bounce tests 1x1 source", () => {
  const SIZE = 1;

  describe("to 1x1 target", () => {
    test("cannot bounce to 1x1 more than 2 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 2 && y >= -2 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 1x1 2 tiles away", () => {
      for (let x = -2; x <= 2; ++x) {
        for (let y = -2; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 2x2 target", () => {
    test("cannot bounce to 2x2 more than 2 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 2 && y >= -2 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 2x2 2 tiles away", () => {
      for (let x = -2; x <= 2; ++x) {
        for (let y = -2; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 3x3 target", () => {
    test("cannot bounce to 3x3 outside of the 4x4 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 1 && y >= -1 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 3x3 within a 4x4 square", () => {
      for (let x = -2; x <= 1; ++x) {
        for (let y = -1; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 4x4 target", () => {
    test("cannot bounce to 4x4 outside of the 3x3 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 0 && y >= 0 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 4x4 within a 3x3 square", () => {
      for (let x = -2; x <= 0; ++x) {
        for (let y = 0; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 5x5 target", () => {
    test("cannot bounce to 5x5 outside of the 3x3 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 0 && y >= 0 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 5x5 within a 3x3 square", () => {
      for (let x = -2; x <= 0; ++x) {
        for (let y = 0; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });
});

describe("venator bounce tests 2x2 source", () => {
  const SIZE = 2;

  describe("to 1x1 target", () => {
    test("cannot bounce to 1x1 more than 3 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 3 && y >= -3 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 1x1 3 tiles away", () => {
      for (let x = -2; x <= 3; ++x) {
        for (let y = -3; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 2x2 target", () => {
    test("cannot bounce to 2x2 more than 3 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -2 && x <= 3 && y >= -3 && y <= 2) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 2x2 3 tiles away", () => {
      for (let x = -2; x <= 3; ++x) {
        for (let y = -3; y <= 2; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 3x3 target", () => {
    test("cannot bounce to 3x3 outside of the 6x6 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -3 && x <= 2 && y >= -2 && y <= 3) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 3x3 within a 6x6 square", () => {
      for (let x = -3; x <= 2; ++x) {
        for (let y = -2; y <= 3; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 4x4 target", () => {
    test("cannot bounce to 4x4 outside of the 5x5 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -3 && x <= 1 && y >= -1 && y <= 3) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 4x4 within a 5x5 square", () => {
      for (let x = -3; x <= 1; ++x) {
        for (let y = -1; y <= 3; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 5x5 target", () => {
    test("cannot bounce to 5x5 outside of the 5x5 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -3 && x <= 1 && y >= -1 && y <= 3) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 5x5 within a 5x5 square", () => {
      for (let x = -3; x <= 1; ++x) {
        for (let y = -1; y <= 3; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });
});

describe("venator bounce tests 3x3 source", () => {
  const SIZE = 3;

  describe("to 1x1 target", () => {
    test("cannot bounce to 1x1 more than 2 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 3 && y >= -3 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 1x1 3 tiles away", () => {
      for (let x = -1; x <= 3; ++x) {
        for (let y = -3; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 2x2 target", () => {
    test("cannot bounce to 2x2 more than 3 tiles away", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 3 && y >= -3 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 2x2 3 tiles away", () => {
      for (let x = -1; x <= 3; ++x) {
        for (let y = -3; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 3x3 target", () => {
    test("cannot bounce to 3x3 outside of the 4x4 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 2 && y >= -2 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 3x3 within a 4x4 square", () => {
      for (let x = -1; x <= 2; ++x) {
        for (let y = -2; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 4x4 target", () => {
    test("cannot bounce to 4x4 outside of the 3x3 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 1 && y >= -1 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 4x4 within a 3x3 square", () => {
      for (let x = -1; x <= 1; ++x) {
        for (let y = -1; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 5x5 target", () => {
    test("cannot bounce to 5x5 outside of the 3x3 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 1 && y >= -1 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 5x5 within a 3x3 square", () => {
      for (let x = -1; x <= 1; ++x) {
        for (let y = -1; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });
});

describe("venator bounce tests 4x4 source", () => {
  const SIZE = 4;

  describe("to 1x1 target", () => {
    test("cannot bounce to 1x1 more outside of 6x6 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 4 && y >= -4 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 1x1 within a 6x6 square", () => {
      for (let x = -1; x <= 4; ++x) {
        for (let y = -4; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 1), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 2x2 target", () => {
    test("cannot bounce to 2x2 more outside of 6x6 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 4 && y >= -4 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 2x2 within 6x6 square", () => {
      for (let x = -1; x <= 4; ++x) {
        for (let y = -4; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 2), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 3x3 target", () => {
    test("cannot bounce to 3x3 outside of the 6x6 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 4 && y >= -4 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 3x3 within a 6x6 square", () => {
      for (let x = -1; x <= 4; ++x) {
        for (let y = -4; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 3), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 4x4 target", () => {
    test("cannot bounce to 4x4 outside of the 5x5 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 3 && y >= -3 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 4x4 within a 5x5 square", () => {
      for (let x = -1; x <= 3; ++x) {
        for (let y = -3; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 4), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });

  describe("to 5x5 target", () => {
    test("cannot bounce to 5x5 outside of the 5x5 square", () => {
      for (let x = -5; x <= 5; ++x) {
        for (let y = -5; y <= 5; ++y) {
          if (x >= -1 && x <= 3 && y >= -3 && y <= 1) {
            continue;
          }
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(false);
        }
      }
    });
    test("can bounce to all 5x5 within a 5x5 square", () => {
      for (let x = -1; x <= 3; ++x) {
        for (let y = -3; y <= 1; ++y) {
          expect(canBounce(0, 0, SIZE, x, y, 5), `${x}, ${y}`).toBe(true);
        }
      }
    });
  });
});

// should add 5x5 source but we don't need it