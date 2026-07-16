// ============================================================================
//  ZAFRKANCIJE — OVU DATOTEKU SLOBODNO UREĐUJ!
// ============================================================================
//  Ovdje žive sve Lovrine provokacije i tetini odgovori.
//  Dodaj novi redak, spremi, osvježi stranicu — i to je to.
//  Hrvatski znakovi (č ć š ž đ) rade bez problema.
//
//  menuTaunts: vrte se na glavnom izborniku, redom.
//    - "lovro" je što Lovro kaže; "teta" je (neobavezan) tetin odgovor.
//  gameTaunts: iskaču tijekom igre na određene događaje.
// ============================================================================

export const menuTaunts = [
  { lovro: "TETA, HOĆEŠ SE BORITI?", teta: "PUSTI ME NA MIRU!" },
  { lovro: "TETA BROJ TRI!" },
  { lovro: "TI SI BEBA!", teta: "NISAM BEBA!" },
  { lovro: "TETA, TI SI BEBA!", teta: "AJME MENI..." },
  { lovro: "JEDAN, DVA, TRI!", teta: "NE OPET..." },
];

export const gameTaunts = {
  // kad pljeska uspije (govori onaj tko pljeska)
  slapHit: ["IMAM TE!", "EVO TI!", "HA!"],
  // kad trkač drži predmet pa pljeska ne vrijedi (govori trkač)
  slapImmune: ["NE-E! DRŽIM NEŠTO!", "HA-HA!", "NE VRIJEDI, NE VRIJEDI!"],
  // pobjednik runde
  roundWin: ["TO-O-O!", "PRELAGANO!", "JOŠ! JOŠ!"],
  // gubitnik runde
  roundLose: ["NIJE FER!", "JOŠ JEDNOM!", "UF!"],
  // Lovro nasumično tijekom igre (samo kad je Lovro u igri, naravno — uvijek je!)
  lovroRandom: ["TETA, TI SI BEBA!", "TETA BROJ TRI!"],
  // "Lovrina pravila": kad ga pljeska pogodi, a on odluči da nije
  lovroDeny: ["NISAM OSJETIO!", "NISI ME!", "VALJDA JA ZNAM!", "TO SE NE RAČUNA!"],
  // tetina reakcija na Lovrino poricanje
  tetaDenyReact: ["MA DAJ!", "JESAM TE!", "LOVRO!!!"],
};

// OVCA — Lovro bleji, teta gubi živce.
export const ovcaTaunts = {
  // Lovro (glumi ovcu)
  lovro: ["BEEE!", "BEEEE, TETA!", "BEEE BEEE!", "NEĆEŠ ME ULOVITI, BEEE!"],
  // teta dok ga lovi
  tetaAngry: ["LOVRO, DOSTA!", "SAD ĆU TE ULOVITI!", "DOĐI OVAMO!"],
  // teta kad ga zgrabi
  tetaCatch: ["IMAM TE!", "SAD ĆEŠ VIDJETI!"],
  // teta kad ga baci
  tetaThrow: ["EVO GA DOLJE!", "TAKO!"],
};

// Baba i BUBA!!!
// VAŽNO: oni se NIKAD ne zovu "baba" i "buba" — uvijek su Lovro i teta.
export const babaBubaTaunts = {
  // Lovro (glumi bubu) zuji i provocira
  buba: ["BZZZZZ!", "NE MOŽEŠ ME ULOVITI!", "TETA, TI SI BEBA!", "BZZZ BZZZ!"],
  // teta gubi živce
  babaAngry: ["LOVRO, DOSTA!", "SAD ĆU TE!", "DOĐI OVAMO!", "MIR, LOVRO!"],
  // teta kad pogodi
  babaSwat: ["IMAM TE!", "TAKO TI I TREBA!"],
};
