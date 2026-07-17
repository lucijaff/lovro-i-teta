// Popis svih igara. Nova igra = nova mapa u src/games/ + jedan redak ovdje.
// Igre s ready:false vode na "USKORO!" ekran dok Lovro ne otkrije pravila.

import jedanDvaTri from "./games/jedanDvaTri/index.js";
import babaIBuba from "./games/babaIBuba/index.js";
import ovca from "./games/ovca/index.js";
import boba from "./games/boba/index.js";

export const GAMES = [
  jedanDvaTri,
  babaIBuba,
  ovca,
  boba,
  // Velika i mala slova su namjerna: "Astuk Boba"
  { id: "astukBoba", title: "Astuk Boba", ready: false },
];

export function registerGameScenes(k) {
  for (const game of GAMES) {
    if (game.ready && game.register) game.register(k);
  }
}
