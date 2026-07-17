// Arena za BOBU: cijeli svijet je VELIKI krevet. Madrac je odskočan,
// stupovi kreveta su rubovi, a jastuci i deka su sigurne zone —
// tko na njih padne, bacanje ne vrijedi.

import { BOBA } from "../../config.js";
import { loadPixelSprite } from "../../sprites/pixel.js";

export const SURFACE_Y = 150; // vrh madraca

// Veliki jastuk, 24×10.
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

export function loadBobaSprites(k) {
  loadPixelSprite(k, "velikiJastuk", [VELIKI_JASTUK], { width: 24, height: 10 });
}

export function buildArena(k) {
  // zid sobe u pozadini + prozor
  k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(46, 36, 56), k.z(-20)]);
  k.add([k.sprite("window"), k.pos(152, 44), k.z(-19)]);
  k.add([k.sprite("poster"), k.pos(48, 48), k.z(-19)]);

  // madrac preko cijele širine: bijela plahta + drvena osnova.
  // Označen kao "bed" pa su svi skokovi odskočni — trampolin!
  k.add([
    k.rect(k.width(), 30),
    k.pos(0, SURFACE_Y),
    k.opacity(0),
    k.area(),
    k.body({ isStatic: true }),
    "ground",
    "bed",
  ]);
  k.add([k.rect(k.width(), 3), k.pos(0, SURFACE_Y), k.color(184, 184, 200), k.z(-11)]);
  k.add([k.rect(k.width(), 15), k.pos(0, SURFACE_Y + 3), k.color(244, 244, 244), k.z(-11)]);
  k.add([k.rect(k.width(), 12), k.pos(0, SURFACE_Y + 18), k.color(122, 74, 30), k.z(-11)]);

  // stupovi kreveta na rubovima (dekor — granice drži klampanje)
  for (const x of [0, k.width() - 16]) {
    for (let i = 0; i < 4; i++) {
      k.add([
        k.sprite(i === 3 ? "bedHeadTop" : "bedHeadBot"),
        k.pos(x, SURFACE_Y - 16 * (i + 1)),
        k.z(-5),
      ]);
    }
  }

  // deka: fiksna zona desno, prebačena preko madraca
  const [bx0, bx1] = BOBA.blanketZone;
  k.add([k.rect(bx1 - bx0, 10, { radius: 2 }), k.pos(bx0, SURFACE_Y - 4), k.color(156, 36, 56), k.z(-10)]);
  for (let x = bx0 + 8; x < bx1 - 4; x += 14) {
    k.add([k.rect(2, 2), k.pos(x, SURFACE_Y), k.color(248, 184, 32), k.z(-9)]);
  }
}

// Postavlja 2 nasumična jastuka po rundi; vraća popis sigurnih zona.
// Zone: { x0, x1 } u pikselima.
export function placePillows(k, prevSprites = []) {
  for (const s of prevSprites) s.destroy();
  const spots = [...BOBA.pillowSpots].sort(() => Math.random() - 0.5).slice(0, 2);
  const sprites = spots.map((x) =>
    k.add([k.sprite("velikiJastuk"), k.pos(x, SURFACE_Y + 1), k.anchor("bot"), k.z(-8)]),
  );
  const zones = spots.map((x) => ({
    x0: x - BOBA.pillowHalfWidth,
    x1: x + BOBA.pillowHalfWidth,
  }));
  zones.push({ x0: BOBA.blanketZone[0], x1: BOBA.blanketZone[1] });
  return { sprites, zones };
}

export function inSafeZone(zones, x) {
  return zones.some((z) => x >= z.x0 && x <= z.x1);
}
