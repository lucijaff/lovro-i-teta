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

  // Baba i BUBA!!! (naziv igre — ali oni su uvijek Lovro i teta!)
  bbIntroBaba: "PLJESNI LOVRU MUHOLOVKOM 3 PUTA!",
  bbIntroBuba: "BJEŽI I MAŠI GUZOM BLIZU TETE!",
  bbSplat: "PLJAS!",
  bbBabaRound: "TETA JE PLJESNULA LOVRU!",
  bbBubaMeterRound: "TETA JE ISPROVOCIRANA!",
  bbBubaTimeRound: "LOVRO JE POBJEGAO!",
  bbMeterLabel: "PROVOKACIJA",
  bbFly: "SKOK/GORE = LET   X = BRZI IZMAK!",

  // OVCA (Lovrove pobjede i metar dijele tekstove s Baba i BUBA)
  ovIntroTeta: "BACI LOVRU DOLJE — KREVET VRIJEDI 2!",
  ovThrowRound: "TETA GA JE BACILA DOLJE!",
  ovTres: "TRES!",
  ovBedBonus: "NA KREVET! +2",
  ovGrabHint: "X = ULOVI / BACI",
  ovLeapHint: "X = BRZI IZMAK!",

  // Astuk Boba (Lovrina strana dijeli tekstove s Baba i BUBA)
  abIntroTeta: "OPALI LOVRU JASTUKOM 3 PUTA!",
  abPuf: "PUF!",
  abHitRound: "TETA GA JE OPALILA JASTUKOM!",
  abSwingHint: "X = ZAMAHNI JASTUKOM!",

  // BOBA
  bobaIntro: "NA LEĐA — JASTUK I DEKA NE VRIJEDE!",
  bobaNaLedja: "NA LEĐA!",
  bobaGolden: "ZLATNO BACANJE!",
  bobaGoldenSub: "SLJEDEĆE BACANJE POBJEĐUJE!",
  bobaHint: "X = BACI!  U LETU STRELICE = PAD",
  taps: ["JEDAN!", "DVA!", "TRI!!!"],

  again: "PONOVNO",
  toMenu: "IZBORNIK",
};
