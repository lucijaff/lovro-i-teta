// Muholovka za "Baba i BUBA!!!": zelena mrežasta glava + drvena drška.
// (Buba je običan Lovro — on se samo PONAŠA kao buba.)

import { loadPixelSprite } from "./pixel.js";

export const MUHOLOVKA = [
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

export function loadMuholovkaSprite(k) {
  loadPixelSprite(k, "muholovka", [MUHOLOVKA], { width: 8, height: 16 });
}
