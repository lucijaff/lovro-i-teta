// Predmeti koje trkač može držati da pljeske "ne vrijede".
// 8×8 piksela. Dodaj novi predmet = nova mreža + redak u OBJECTS.

import { loadPixelSprite } from "./pixel.js";

const JASTUK = [
  "........",
  ".WWWWWW.",
  "WWWWWWWW",
  "WEWWWWEW",
  "WWWWWWWW",
  ".WWWWWW.",
  "........",
  "........",
];

const MEDO = [
  ".H....H.",
  ".HHHHHH.",
  ".HKHHKH.",
  ".HHHHHH.",
  "..HHHH..",
  ".HHHHHH.",
  ".HH..HH.",
  "........",
];

const KNJIGA = [
  "........",
  ".GGGGGG.",
  ".GWWWWG.",
  ".GWWWWG.",
  ".GWWWWG.",
  ".GGGGGG.",
  "........",
  "........",
];

export const OBJECTS = [
  { id: "jastuk", title: "JASTUK", grid: JASTUK },
  { id: "medo", title: "MEDO", grid: MEDO },
  { id: "knjiga", title: "KNJIGA", grid: KNJIGA },
];

export function loadObjectSprites(k) {
  for (const o of OBJECTS) {
    loadPixelSprite(k, o.id, [o.grid], { width: 8, height: 8 });
  }
}
