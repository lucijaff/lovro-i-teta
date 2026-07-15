// Stanje koje preživljava promjene scena.
// Oblikovano kao popis igrača da se kasnije lako doda drugi igrač (2P mod).

export const session = {
  // Lik kojim upravlja igrač: "lovro" ili "teta".
  playerCharacter: "lovro",
  // Budući 2P: [{ character, controllerKind }, ...] — za sada uvijek jedan.
  players: [{ character: "lovro", controllerKind: "keyboard" }],
};

export function setPlayerCharacter(id) {
  session.playerCharacter = id;
  session.players[0].character = id;
}
