// BUBA — Lovro kao buba (za "Baba i BUBA!!!"): bubamara s Lovrinom frizurom.
// I muholovka kojom baba maše.

import { loadPixelSprite } from "./pixel.js";

// 16×16, gleda udesno: glava naprijed, crveno tijelo s točkama, krila gore.
const BUBA_FLY0 = [
  "................",
  "................",
  "...EEEE....K..K.",
  "..EEEEEE....KK..",
  "..EEEE.....HHHH.",
  "..........HHHHH.",
  ".RRRRRRRR.HSSSS.",
  "RRKRRKRRRRSSKSS.",
  "RRRRRRRRRRSSSSS.",
  "RRKRRKRRRRSSKKS.",
  ".RRRRRRRR.SSSSS.",
  "..K..K..K.......",
  "..K..K..K.......",
  "................",
  "................",
  "................",
];

const BUBA_FLY1 = [
  "................",
  "................",
  "...........K..K.",
  "............KK..",
  "...EEE.....HHHH.",
  "..EEEEEE..HHHHH.",
  ".RRRRRRRR.HSSSS.",
  "RRKRRKRRRRSSKSS.",
  "RRRRRRRRRRSSSSS.",
  "RRKRRKRRRRSSKKS.",
  ".RRRRRRRR.SSSSS.",
  "..K..K..K.......",
  "..K..K..K.......",
  "................",
  "................",
  "................",
];

// Muholovka: zelena mrežasta glava + drvena drška. 8×16, drška dolje.
const MUHOLOVKA = [
  ".GGGGGG.",
  "GG.GG.GG",
  "GGGGGGGG",
  "GG.GG.GG",
  "GGGGGGGG",
  "GG.GG.GG",
  ".GGGGGG.",
  "..NNNN..",
  "...NN...",
  "...NN...",
  "...NN...",
  "...NN...",
  "...NN...",
  "...NN...",
  "...NN...",
  "...NN...",
];

export const BUBA_GRIDS = {
  buba: [BUBA_FLY0, BUBA_FLY1],
  muholovka: [MUHOLOVKA],
};

export function loadBubaSprites(k) {
  loadPixelSprite(k, "buba", [BUBA_FLY0, BUBA_FLY1], {
    width: 16,
    height: 16,
    anims: { fly: { from: 0, to: 1, speed: 12, loop: true } },
  });
  loadPixelSprite(k, "muholovka", [MUHOLOVKA], { width: 8, height: 16 });
}
