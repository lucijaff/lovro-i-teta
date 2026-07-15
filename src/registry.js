// Popis svih igara. Nova igra = nova mapa u src/games/ + jedan redak ovdje.
// Igre s ready:false vode na "USKORO!" ekran dok Lovro ne otkrije pravila.

import jedanDvaTri from "./games/jedanDvaTri/index.js";

export const GAMES = [
  jedanDvaTri,
  // Velika i mala slova su namjerna i VAŽNA: "Baba i BUBA!!!"
  { id: "babaIBuba", title: "Baba i BUBA!!!", ready: false },
  { id: "ovca", title: "OVCA", ready: false },
  { id: "boba", title: "BOBA", ready: false },
];

export function registerGameScenes(k) {
  for (const game of GAMES) {
    if (game.ready && game.register) game.register(k);
  }
}
