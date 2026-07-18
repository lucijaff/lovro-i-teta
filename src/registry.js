// Popis svih igara. Nova igra = nova mapa u src/games/ + jedan redak ovdje.
// Stavka s "submenu" otvara podizbornik (npr. BOBA → vrste bobe).

import jedanDvaTri from "./games/jedanDvaTri/index.js";
import babaIBuba from "./games/babaIBuba/index.js";
import ovca from "./games/ovca/index.js";
import boba from "./games/boba/index.js";
import astukBoba from "./games/astukBoba/index.js";
import mcRun from "./games/mcRun/index.js";

export const GAMES = [
  jedanDvaTri,
  babaIBuba,
  ovca,
  mcRun,
  {
    id: "bobaGroup",
    title: "BOBA",
    submenuTitle: "VRSTA BOBE",
    // Velika i mala slova su namjerna i VAŽNA: "Obična boba", "Astuk boba"
    submenu: [
      { label: "Obična boba", game: boba },
      { label: "Astuk boba", game: astukBoba },
    ],
  },
];

// Sve stvarne igre (i one skrivene u podizbornicima), za registraciju scena.
export function allGames() {
  const out = [];
  for (const g of GAMES) {
    if (g.submenu) out.push(...g.submenu.map((s) => s.game));
    else out.push(g);
  }
  return out;
}

export function registerGameScenes(k) {
  for (const game of allGames()) {
    if (game.ready && game.register) game.register(k);
  }
}
