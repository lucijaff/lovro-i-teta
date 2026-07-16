// Sve brojke koje mijenjaju osjećaj igre na jednom mjestu.
// (All the numbers that change how the game feels, in one place.)

export const SCREEN = {
  width: 320,
  height: 180,
};

export const PHYSICS = {
  gravity: 1100,
  moveSpeed: 95,
  jumpForce: 410,
  bedBounce: 1.3, // skok s kreveta je jači (jumping off the bed is stronger)
};

// Prava Lovrina pravila: OBOJE pljeskaju istovremeno, tko prvi skupi 3
// pljeske (bilo kada, ne zaredom) osvaja rundu.
export const JEDAN_DVA_TRI = {
  winsNeeded: 2, // meč: najbolji od 3 runde
  maxRounds: 3,
  roundTime: 60, // sekundi po rundi
  slapsToWin: 3, // JEDAN, DVA, TRI!
  slapCooldown: 0.35,
  slapReach: 13, // koliko daleko pljeska dohvaća
  hitInvulnTime: 0.9, // nakon primljene pljeske kratko si nedodirljiv (treperiš)
  holdCrumbleTime: 5, // predmet se raspadne nakon ovoliko sekundi držanja
  holdBlinkTime: 1.5, // zadnjih X sekundi predmet treperi
  holdSlowdown: 0.75, // brzina dok držiš predmet
  objectRespawnTime: 4,
  grabRange: 16,
  regrabCooldown: 2, // nakon ispuštanja, predmet se ne može odmah uzeti
  objectCount: 3,
};

// Baba i BUBA!!! — teta (baba) lovi Lovru (bubu) muholovkom.
// Buba pobjeđuje twerkanjem BLIZU babe (puni "provokaciju") ili bijegom do isteka.
export const BABA_I_BUBA = {
  winsNeeded: 2, // meč: najbolji od 3 runde
  maxRounds: 3,
  roundTime: 45,
  swatsToWin: 3, // koliko puta baba mora pljesnuti bubu
  swatCooldown: 0.8, // muholovka se mora "napeti" između zamaha
  swatReach: 17,
  hitInvulnTime: 1.6, // buba nakon udarca kratko nedodirljiva
  tauntRange: 44, // koliko blizu babe mahanje guzom puni provokaciju
  tauntTime: 3, // ukupno sekundi bliskog mahanja za pobjedu
  twerkSlowdown: 0.4, // buba se sporo šulja dok maše guzom
  bubaSpeed: 130, // buba je osjetno brža od babe
  bubaGravityScale: 0.5, // buba lebdi
  bubaFlapForce: 210, // zamah krilima (može i u zraku!)
  dashSpeed: 300, // buba: nagli let u stranu (X)
  dashCooldown: 1.1,
  dashInvuln: 0.4, // pokriva cijeli zum — pljas ne vrijedi ni na pola puta
  ai: {
    // baba (CPU)
    swatReactionMin: 0.25,
    swatReactionMax: 0.7,
    // buba (CPU)
    diveInterval: 4, // svakih ~X sekundi buba se spusti provocirati
    fleeDistance: 40, // pobjegne kad je baba ovako blizu
  },
};

// OVCA — Lovro je ovca (i dalje izgleda kao Lovro), teta ga lovi,
// diže iznad glave i baca dolje. Krevet vrijedi duplo!
export const OVCA = {
  winsNeeded: 2, // meč: najbolji od 3 runde
  maxRounds: 3,
  roundTime: 45,
  pointsToWin: 4, // bodovi za tetinu pobjedu u rundi (krevet 2× ili pod 4×)
  floorPoints: 1, // bacanje bilo gdje
  bedPoints: 2, // bacanje na krevet — vrijedi se pomučiti!
  grabRange: 20,
  grabCooldown: 1.2, // promašen pokušaj košta — mora se "resetirati"
  carryMaxTime: 2.5, // Lovro je pretežak — nakon ovoga isklizne
  carrySlowdown: 0.7, // teta hoda sporije dok ga nosi
  // Bacanje je TRES DOLJE pred njom, ne izbačaj preko pola sobe —
  // veliki vodoravni zamah je prebacivao krevet pa je "bacanje na
  // krevet" slijetalo na pod iza uzglavlja (1 bod umjesto 2).
  throwVelX: 35,
  throwVelY: -40,
  hitInvulnTime: 1.8, // nakon bacanja/iskliznuća kratko nedodirljiv
  tauntRange: 52,
  tauntTime: 2.6, // sekundi mahanja za punu provokaciju...
  // ...ali što bliže teti, to brže puni (do 2× tik uz nju)!
  twerkSlowdown: 0.4,
  lovroSpeed: 115, // ovca je brža od tete
  leapSpeed: 260, // BRZI IZMAK (X): ovčji skok u stranu
  leapJump: 170,
  leapCooldown: 1.1,
  leapInvuln: 0.5, // pokriva CIJELI luk skoka — izmak kroz tetu ne smije
  // završiti u njenim rukama na pola puta
  ai: {
    grabReactionMin: 0.35,
    grabReactionMax: 0.8,
    approachInterval: 4, // svakih ~X sekundi ovca dođe provocirati
    fleeDistance: 46,
    fleeAtDive: 16, // dok provocira, bježi tek kad je STVARNO gusto
  },
};

// "Lovrina pravila" — Lovro izmišlja pravila u hodu, pogotovo kad gubi.
// Kad je Lovro trkač i pljeska ga zakonito pogodi, ponekad jednostavno
// izjavi da nije bilo ništa ("NISAM OSJETIO!") i pljeska se poništi.
export const LOVRO_RULES = {
  denyChance: 0.2, // osnovna šansa poricanja
  denyChanceWhenLosing: 0.45, // šansa kad Lovro gubi (naravno da je veća)
  maxDenialsPerRound: 2, // da ne bude PREVIŠE nepravedno
};

export const AI = {
  tickTime: 0.3, // koliko često CPU "razmišlja" — veće = gluplji i lakši
  tickJitter: 0.15,
  slapReactionMin: 0.15,
  slapReactionMax: 0.45,
  hesitateChance: 0.35, // šansa da CPU zastane kad je trkač imun
  hesitateTime: 0.7,
  panicHopChance: 0.08,
  seekObjectDistance: 70, // trkač traži predmet samo ako je lovac dalje od ovoga
  cornerDistance: 26, // koliko blizu zida se trkač osjeća stjeran u kut
};

export const UI = {
  fontSize: 8,
  bubbleDuration: 2.4,
  bubbleMaxWidth: 100,
  bannerDuration: 1.6,
  menuTauntInterval: 5,
};
