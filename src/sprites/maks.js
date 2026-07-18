// MAKS — naša crna mačka, 14×10, gleda udesno.
// Žute oči i sivkasti odsjaj po leđima da se vidi na tamnoj pozadini.

import { loadPixelSprite } from "./pixel.js";

export const MAKS = [
  ".........D.DD.",
  ".........KKKK.",
  "DD.......KYKYK",
  ".DK......KKKKK",
  "..KKKKKKKKKKK.",
  "..KKKKKKKKKK..",
  "..KK......KK..",
  "..KK......KK..",
  "..............",
  "..............",
];

export function loadMaksSprite(k) {
  loadPixelSprite(k, "maks", [MAKS], { width: 14, height: 10 });
}
