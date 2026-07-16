// Svi tekstovi u igri, na hrvatskom, na jednom mjestu.

export const STR = {
  title: "LOVRO I TETA",
  subtitle: "LOVRINE IGRE",
  chooseGame: "ODABERI IGRU",
  choosePlayer: "ODABERI IGRAČA",
  youAre: "TI SI:",
  soon: "USKORO!",
  soonSub: "LOVRO JOŠ SMIŠLJA PRAVILA...",
  pressAny: "PRITISNI BILO ŠTO",
  controlsHint1: "STRELICE/WASD = TRK I SKOK",
  controlsHint2: "X = PLJESKA  C = UZMI  S = GUZA",
  menuHint: "GORE/DOLJE = BIRAJ   ENTER = KRENI",

  round: (n, total) => `RUNDA ${n}/${total}`,
  firstTo: "PRVI DO 3 PLJESKE!",
  golden: "ZLATNA PLJESKA!",
  goldenSub: "SLJEDEĆA PLJESKA POBJEĐUJE!",
  goldenShort: "ZLATNA!",
  roundWin: (name) => `${name} OSVAJA RUNDU!`,
  matchWin: (name) => `${name} POBJEĐUJE!`,
  invalid: "NE VRIJEDI!",
  lovroRule: "LOVRINO PRAVILO!",

  // Baba i BUBA!!!
  bbIntroBaba: "TI SI BABA — PLJESNI BUBU 3 PUTA!",
  bbIntroBuba: "TI SI BUBA — BJEŽI I TWERKAJ UZ BABU!",
  bbSplat: "PLJAS!",
  bbBabaRound: "BABA JE PLJESNULA BUBU!",
  bbBubaMeterRound: "BABA JE ISPROVOCIRANA!",
  bbBubaTimeRound: "BUBA JE POBJEGLA!",
  bbMeterLabel: "PROVOKACIJA",
  bbFly: "SKOK/GORE = LET (MAŠI KRILIMA!)",
  taps: ["JEDAN!", "DVA!", "TRI!!!"],

  again: "PONOVNO",
  toMenu: "IZBORNIK",
};
