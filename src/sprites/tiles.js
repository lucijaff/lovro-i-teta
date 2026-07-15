// Sobni tileset — 16×16 pločice za razinu (tetina soba).

import { loadPixelSprite } from "./pixel.js";

const FLOOR = [
  "NNNNNNNNNNNNNNNN",
  "OOOOOOONOOOOOOOO",
  "OOOOOOONOOOOOOOO",
  "OOOOOOONOOOOOOOO",
  "NNNNNNNNNNNNNNNN",
  "OOONOOOOOOONOOOO",
  "OOONOOOOOOONOOOO",
  "OOONOOOOOOONOOOO",
  "NNNNNNNNNNNNNNNN",
  "OOOOOOONOOOOOOOO",
  "OOOOOOONOOOOOOOO",
  "OOOOOOONOOOOOOOO",
  "NNNNNNNNNNNNNNNN",
  "OOONOOOOOOONOOOO",
  "OOONOOOOOOONOOOO",
  "OOONOOOOOOONOOOO",
];

const BED_MID = [
  "WWWWWWWWWWWWWWWW",
  "WWWWWWWWWWWWWWWW",
  "MMMMMMMMMMMMMMMM",
  "MMMMMMMMMMMMMMMM",
  "MMYMMMMYMMMMYMMM",
  "MMMMMMMMMMMMMMMM",
  "MMMMMMMMMMMMMMMM",
  "MYMMMMYMMMMYMMMM",
  "MMMMMMMMMMMMMMMM",
  "MMMMYMMMMYMMMMYM",
  "MMMMMMMMMMMMMMMM",
  "MMMMMMMMMMMMMMMM",
  "NNNNNNNNNNNNNNNN",
  "NNNNNNNNNNNNNNNN",
  "NNNNNNNNNNNNNNNN",
  "NNNNNNNNNNNNNNNN",
];

const BED_HEAD_TOP = [
  "................",
  "................",
  "................",
  "..NNNNNNNNNNNN..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
];

const BED_HEAD_BOT = [
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
  "..NOOOOOOOOOON..",
];

const BED_FOOT = [
  "................",
  "................",
  "................",
  "................",
  "NNNNNNNNNN......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
  "NOOOOOOOON......",
];

const SHELF = [
  "NNNNNNNNNNNNNNNN",
  "OOOOOOOOOOOOOOOO",
  "OOOOOOOOOOOOOOOO",
  "NNNNNNNNNNNNNNNN",
  "..N..........N..",
  "..N..........N..",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const WINDOW = [
  "NNNNNNNNNNNNNNNN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NNNNNNNNNNNNNNNN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NFFFFFFFNFFFFFFN",
  "NNNNNNNNNNNNNNNN",
  "................",
];

// Dječji crtež na zidu: sunce i trava.
const POSTER = [
  "................",
  ".WWWWWWWWWWWWW..",
  ".WWWWWWYYWWWWW..",
  ".WWWWWYYYYWWWW..",
  ".WWWWWWYYWWWWW..",
  ".WWWWWWWWWWWWW..",
  ".WWRWWWWWWWRWW..",
  ".WGGGGGGGGGGGW..",
  ".WGGGGGGGGGGGW..",
  ".WWWWWWWWWWWWW..",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

const QBLOCK = [
  "KKKKKKKKKKKKKKKK",
  "KYYYYYYYYYYYYYYK",
  "KYFYYYYYYYYYYFYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYFYYYYYYYYYYFYK",
  "KYYYYYYYYYYYYYYK",
  "KKKKKKKKKKKKKKKK",
];

export const TILES = [
  ["floor", FLOOR],
  ["bedMid", BED_MID],
  ["bedHeadTop", BED_HEAD_TOP],
  ["bedHeadBot", BED_HEAD_BOT],
  ["bedFoot", BED_FOOT],
  ["shelf", SHELF],
  ["window", WINDOW],
  ["poster", POSTER],
  ["qblock", QBLOCK],
];

export function loadTileSprites(k) {
  for (const [name, grid] of TILES) {
    loadPixelSprite(k, name, [grid], { width: 16, height: 16 });
  }
}
