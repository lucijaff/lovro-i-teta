// HUD: runde, vrijeme i pljeska-pločice (JEDAN-DVA-TRI) za oba igrača.

import { STR } from "../../strings.js";

export function createHud(k, slapsToWin = 3) {
  const dark = k.rgb(26, 28, 44);
  const gold = k.rgb(248, 184, 32);
  const white = k.rgb(244, 244, 244);
  const red = k.rgb(216, 40, 16);

  k.add([k.rect(k.width(), 24), k.pos(0, 0), k.color(dark), k.opacity(0.8), k.z(100)]);

  const lovroText = k.add([
    k.text("LOVRO 0", { size: 8 }),
    k.pos(4, 4),
    k.color(white),
    k.z(101),
  ]);
  const tetaText = k.add([
    k.text("TETA 0", { size: 8 }),
    k.pos(k.width() - 4, 4),
    k.anchor("topright"),
    k.color(white),
    k.z(101),
  ]);
  const roundText = k.add([
    k.text("", { size: 8 }),
    k.pos(k.width() / 2, 4),
    k.anchor("top"),
    k.color(gold),
    k.z(101),
  ]);
  const timeText = k.add([
    k.text("", { size: 8 }),
    k.pos(k.width() / 2, 13),
    k.anchor("top"),
    k.color(white),
    k.z(101),
  ]);

  // pljeska-pločice: lijevo Lovrine, desno tetine
  const makePips = (x, dir) =>
    Array.from({ length: slapsToWin }, (_, i) =>
      k.add([
        k.rect(7, 7),
        k.pos(x + dir * i * 11, 13),
        k.color(dark),
        k.outline(1, white),
        k.z(101),
      ]),
    );
  const pips = {
    lovro: makePips(5, 1),
    teta: makePips(k.width() - 12, -1),
  };

  return {
    setRoundWins(scores) {
      lovroText.text = `LOVRO ${scores.lovro}`;
      tetaText.text = `TETA ${scores.teta}`;
    },
    setRound(round, total) {
      roundText.text = STR.round(round, total);
    },
    setTime(t) {
      const s = Math.max(0, Math.ceil(t));
      timeText.text = `0:${String(s).padStart(2, "0")}`;
      timeText.color = s <= 10 ? red : white;
    },
    setGolden() {
      timeText.text = STR.goldenShort;
      timeText.color = gold;
    },
    setSlaps(slaps) {
      for (const id of ["lovro", "teta"]) {
        pips[id].forEach((p, i) => {
          p.color = i < slaps[id] ? red : dark;
        });
      }
    },
  };
}
