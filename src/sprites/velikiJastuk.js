// Veliki jastuk, 24×10 — sigurna zona u Bobi i tetino oružje u Astuk Bobi.

import { loadPixelSprite } from "./pixel.js";

export const VELIKI_JASTUK = [
  "....WWWWWWWWWWWWWWWW....",
  "..WWWWWWWWWWWWWWWWWWWW..",
  ".WWWWWWWWWWWWWWWWWWWWWW.",
  "WWWWWWWWWWWWWWWWWWWWWWWW",
  "WWEWWWWWWWWWWWWWWWWWWEWW",
  "WWWWWWWWWWWWWWWWWWWWWWWW",
  ".WWWWWWWWWWWWWWWWWWWWWW.",
  "..WWWWWWWWWWWWWWWWWWWW..",
  "....WWWWWWWWWWWWWWWW....",
  "........................",
];

export function loadVelikiJastukSprite(k) {
  loadPixelSprite(k, "velikiJastuk", [VELIKI_JASTUK], { width: 24, height: 10 });
}
