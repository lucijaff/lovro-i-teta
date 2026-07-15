// Sloj za upravljanje: logičke akcije umjesto tipki.
// Sve (igrač, CPU, budući 2P ili touch) daje isti oblik "kontrolera":
//   { isDown(akcija), consumePress(akcija) }
// pa kod borca ne zna tko ga zapravo pokreće.

export const BINDINGS = {
  // Solo: rade i strelice i WASD.
  solo: {
    left: ["left", "a"],
    right: ["right", "d"],
    jump: ["up", "w", "space"],
    slap: ["x", "k"],
    grab: ["c", "l"],
    twerk: ["down", "s"],
  },
  // Za budući 2P mod (dvije polovice tipkovnice):
  p1: { left: ["a"], right: ["d"], jump: ["w"], slap: ["f"], grab: ["g"], twerk: ["s"] },
  p2: { left: ["left"], right: ["right"], jump: ["up"], slap: ["k"], grab: ["l"], twerk: ["down"] },
};

// Kontroler s tipkovnice. Stvori ga UNUTAR scene — kaplay tada sam počisti
// slušače pri izlasku iz scene.
export function keyboardController(k, bindings = BINDINGS.solo) {
  const pressed = {};
  for (const [action, keys] of Object.entries(bindings)) {
    for (const key of keys) {
      k.onKeyPress(key, () => {
        pressed[action] = true;
      });
    }
  }
  return {
    isDown: (action) => (bindings[action] ?? []).some((key) => k.isKeyDown(key)),
    consumePress: (action) => {
      const was = !!pressed[action];
      pressed[action] = false;
      return was;
    },
  };
}

// Virtualni kontroler za CPU (AI ga "pritišće" umjesto prstiju).
export function virtualController() {
  let down = {};
  let presses = {};
  return {
    isDown: (action) => !!down[action],
    consumePress: (action) => {
      const was = !!presses[action];
      presses[action] = false;
      return was;
    },
    // AI strana:
    hold: (action, value = true) => {
      down[action] = value;
    },
    press: (action) => {
      presses[action] = true;
    },
    releaseAll: () => {
      down = {};
      presses = {};
    },
  };
}
