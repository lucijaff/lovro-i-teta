// Lovro i teta kao ASCII pixel-art. Svaki znak = piksel (boje u palette.js).
// Likovi se slažu iz dijelova: glava + trup + noge, pa ne treba crtati svaki
// frame ispočetka. Svi redovi moraju imati točno 16 znakova!
//
// Za crtanje novog framea: kopiraj dio, mijenjaj slova. "." je prozirno.

import { loadPixelSprite, pad, stack, shift } from "./pixel.js";

export const CHAR_W = 16;
export const CHAR_H = 24;

// ---------------------------------------------------------------- LOVRO ----
// 9 godina, kratka smeđa kosa (H), crvena majica (R), traperice (L).
// Niži je od tete: 3 prazna reda na vrhu.

const LOVRO_HEADS = {
  normal: [
    "....HHHHHH......",
    "...HHHHHHHH.....",
    "...HHHHHHHHH....",
    "...HSSSSSSH.....",
    "...SSKSSKSS.....",
    "...SSSSSSSS.....",
    "...SSSSKKSS.....",
    "....SSSSSS......",
  ],
  blink: [
    "....HHHHHH......",
    "...HHHHHHHH.....",
    "...HHHHHHHHH....",
    "...HSSSSSSH.....",
    "...SSKKSKKS.....",
    "...SSSSSSSS.....",
    "...SSSSKKSS.....",
    "....SSSSSS......",
  ],
  annoyed: [
    "....HHHHHH......",
    "...HHHHHHHH.....",
    "...HHHHHHHHH....",
    "...HSKSSKSH.....",
    "...SSKSSKSS.....",
    "...SSSSSSSS.....",
    "...SSKKKKSS.....",
    "....SSSSSS......",
  ],
  ouch: [
    "....HHHHHH......",
    "...HHHHHHHH.....",
    "...HHHHHHHHH....",
    "...HSSSSSSH.....",
    "...SSKKSKKS.....",
    "...SSSSSSSS.....",
    "...SSKKKKSS.....",
    "....SSSSSS......",
  ],
};

const LOVRO_TORSOS = {
  idle: [
    "....RRRRRR......",
    "...RRRRRRRR.....",
    "..SRRRRRRRRS....",
    "..SRRRRRRRRS....",
    "...RRRRRRRR.....",
    "....RRRRRR......",
  ],
  wind: [
    "....RRRRRR......",
    ".S.RRRRRRRR.....",
    ".SSRRRRRRRR.....",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "....RRRRRR......",
  ],
  slap: [
    "....RRRRRR......",
    "...RRRRRRRR.....",
    "..SRRRRRRRRSSS..",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "....RRRRRR......",
  ],
  hold: [
    "..S.RRRRRR..S...",
    "..SSRRRRRRSS....",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "....RRRRRR......",
  ],
  ouch: [
    ".S..........S...",
    "..S.RRRRRR..S...",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "...RRRRRRRR.....",
    "....RRRRRR......",
  ],
};

const LOVRO_LEGS = {
  stand: [
    "....LLLLLL......",
    "....LLLLLL......",
    "....LL..LL......",
    "....LL..LL......",
    "....LL..LL......",
    "...KKK..KKK.....",
    "...KKK..KKK.....",
  ],
  run0: [
    "....LLLLLL......",
    "....LLLLLL......",
    "...LL....LL.....",
    "..LL......LL....",
    "..LL......LL....",
    ".KKK......KKK...",
    ".KKK......KKK...",
  ],
  run1: [
    "....LLLLLL......",
    "....LLLLLL......",
    "....LLLL........",
    "....LLLL........",
    "....LLLL........",
    "....KKKK........",
    "....KKKK........",
  ],
  run2: [
    "....LLLLLL......",
    "....LLLLLL......",
    "....LL..LL......",
    "...LL....LL.....",
    "...LL....LL.....",
    "..KKK....KKK....",
    "..KKK....KKK....",
  ],
  jump: [
    "....LLLLLL......",
    "....LLLLLL......",
    "...LL....LL.....",
    "...LL....LL.....",
    "..KKK....KKK....",
    "..KKK....KKK....",
    "................",
  ],
  tap: [
    "....LLLLLL......",
    "....LLLLLL......",
    "....LL..LL......",
    "....LL..LL......",
    "....LL..LL......",
    "...KKK.KKK......",
    "...KKK.KKK......",
  ],
};

// ----------------------------------------------------------------- TETA ----
// 43 godine, smeđa bob frizura (B), roza majica (P), tamne hlače (D).
// Viša je: bez praznih redova na vrhu.

const TETA_HEADS = {
  normal: [
    "....BBBBBB......",
    "...BBBBBBBB.....",
    "..BBBBBBBBBB....",
    "..BBSSSSSSBB....",
    "..BBSKSSKSBB....",
    "..BBSSSSSSBB....",
    "..BBSSKKSSBB....",
    "..BBBSSSSBBB....",
    ".....SSSS.......",
  ],
  blink: [
    "....BBBBBB......",
    "...BBBBBBBB.....",
    "..BBBBBBBBBB....",
    "..BBSSSSSSBB....",
    "..BBSKKSKKBB....",
    "..BBSSSSSSBB....",
    "..BBSSKKSSBB....",
    "..BBBSSSSBBB....",
    ".....SSSS.......",
  ],
  annoyed: [
    "..M.BBBBBB.M....",
    "...BBBBBBBB.....",
    "..BBBBBBBBBB....",
    "..BBSSSSSSBB....",
    "..BBSKSSKSBB....",
    "..BBSSSSSSBB....",
    "..BBSKKKKSBB....",
    "..BBBSSSSBBB....",
    ".....SSSS.......",
  ],
  ouch: [
    "....BBBBBB......",
    "...BBBBBBBB.....",
    "..BBBBBBBBBB....",
    "..BBSSSSSSBB....",
    "..BBSKKSKKBB....",
    "..BBSSSSSSBB....",
    "..BBSKKKKSBB....",
    "..BBBSSSSBBB....",
    ".....SSSS.......",
  ],
};

const TETA_TORSOS = {
  idle: [
    "....PPPPPP......",
    "...PPPPPPPP.....",
    "..SPPPPPPPPS....",
    "..SPPPPPPPPS....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "....PPPPPP......",
  ],
  wind: [
    "....PPPPPP......",
    ".S.PPPPPPPP.....",
    ".SSPPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "....PPPPPP......",
  ],
  slap: [
    "....PPPPPP......",
    "...PPPPPPPP.....",
    "..SPPPPPPPPSSS..",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "....PPPPPP......",
  ],
  hold: [
    "..S.PPPPPP..S...",
    "..SSPPPPPPSS....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "....PPPPPP......",
  ],
  ouch: [
    ".S..........S...",
    "..S.PPPPPP..S...",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "...PPPPPPPP.....",
    "....PPPPPP......",
  ],
};

const TETA_LEGS = {
  stand: [
    "....DDDDDD......",
    "....DDDDDD......",
    "....DD..DD......",
    "....DD..DD......",
    "....DD..DD......",
    "....DD..DD......",
    "...KKK..KKK.....",
    "...KKK..KKK.....",
  ],
  run0: [
    "....DDDDDD......",
    "....DDDDDD......",
    "...DD....DD.....",
    "..DD......DD....",
    "..DD......DD....",
    "..DD......DD....",
    ".KKK......KKK...",
    ".KKK......KKK...",
  ],
  run1: [
    "....DDDDDD......",
    "....DDDDDD......",
    "....DDDD........",
    "....DDDD........",
    "....DDDD........",
    "....DDDD........",
    "....KKKK........",
    "....KKKK........",
  ],
  run2: [
    "....DDDDDD......",
    "....DDDDDD......",
    "....DD..DD......",
    "...DD....DD.....",
    "...DD....DD.....",
    "...DD....DD.....",
    "..KKK....KKK....",
    "..KKK....KKK....",
  ],
  jump: [
    "....DDDDDD......",
    "....DDDDDD......",
    "...DD....DD.....",
    "...DD....DD.....",
    "..KKK....KKK....",
    "..KKK....KKK....",
    "................",
    "................",
  ],
  tap: [
    "....DDDDDD......",
    "....DDDDDD......",
    "....DD..DD......",
    "....DD..DD......",
    "....DD..DD......",
    "....DD..DD......",
    "...KKK.KKK......",
    "...KKK.KKK......",
  ],
};

// ------------------------------------------------------------ SLAGANJE ----
// Redoslijed frameova (isti za oba lika):
// 0-1 idle  2-4 run  5 jump  6-7 slap  8 hold  9-10 holdrun  11 ouch
// 12-13 annoyed  14-15 twerk

export function buildFrames({ padRows, heads, torsos, legs }) {
  const F = (h, t, l) => stack(pad(padRows), heads[h], torsos[t], legs[l]);
  // Twerk: ramena naprijed, kukovi natrag, pa guza maše lijevo-desno.
  const twerk = (hipShift) =>
    stack(
      pad(padRows),
      shift(heads.normal, 2),
      shift(torsos.idle, 2),
      shift(legs.stand, hipShift),
    );
  return [
    F("normal", "idle", "stand"),
    F("blink", "idle", "stand"),
    F("normal", "idle", "run0"),
    F("normal", "idle", "run1"),
    F("normal", "idle", "run2"),
    F("normal", "idle", "jump"),
    F("normal", "wind", "stand"),
    F("normal", "slap", "stand"),
    F("normal", "hold", "stand"),
    F("normal", "hold", "run0"),
    F("normal", "hold", "run2"),
    F("ouch", "ouch", "stand"),
    F("annoyed", "idle", "stand"),
    F("annoyed", "idle", "tap"),
    twerk(-3),
    twerk(-1),
  ];
}

const ANIMS = {
  idle: { frames: [0, 0, 0, 0, 1], speed: 3, loop: true }, // trepne tu i tamo
  run: { from: 2, to: 4, speed: 10, loop: true },
  jump: { from: 5, to: 5 },
  slap: { from: 6, to: 7, speed: 14 },
  hold: { from: 8, to: 8 },
  holdrun: { from: 9, to: 10, speed: 10, loop: true },
  ouch: { from: 11, to: 11 },
  annoyed: { from: 12, to: 13, speed: 3, loop: true },
  twerk: { from: 14, to: 15, speed: 9, loop: true },
};

// Podaci o likovima — i za igru i za tekstove (hrvatski rodovi!).
export const CHARACTERS = {
  lovro: {
    id: "lovro",
    title: "LOVRO",
    parts: { padRows: 3, heads: LOVRO_HEADS, torsos: LOVRO_TORSOS, legs: LOVRO_LEGS },
  },
  teta: {
    id: "teta",
    title: "TETA",
    parts: { padRows: 0, heads: TETA_HEADS, torsos: TETA_TORSOS, legs: TETA_LEGS },
  },
};

export function otherCharacter(id) {
  return id === "lovro" ? "teta" : "lovro";
}

export function loadCharacterSprites(k) {
  for (const c of Object.values(CHARACTERS)) {
    loadPixelSprite(k, c.id, buildFrames(c.parts), {
      width: CHAR_W,
      height: CHAR_H,
      anims: ANIMS,
    });
  }
}
