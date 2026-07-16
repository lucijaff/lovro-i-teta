// HUD za Baba i BUBA!!!: provokacija-metar za bubu, pljas-pločice za babu.

import { STR } from "../../strings.js";

export function createHud(k, swatsToWin = 3) {
  const dark = k.rgb(26, 28, 44);
  const gold = k.rgb(248, 184, 32);
  const white = k.rgb(244, 244, 244);
  const red = k.rgb(216, 40, 16);

  k.add([k.rect(k.width(), 24), k.pos(0, 0), k.color(dark), k.opacity(0.8), k.z(100)]);

  // lijevo: LOVRO + provokacija-metar
  k.add([k.text("LOVRO", { size: 8 }), k.pos(4, 4), k.color(white), k.z(101)]);
  const METER_W = 56;
  k.add([
    k.rect(METER_W + 2, 8),
    k.pos(4, 13),
    k.color(dark),
    k.outline(1, white),
    k.z(101),
  ]);
  const meterFill = k.add([
    k.rect(0.001, 6),
    k.pos(5, 14),
    k.color(gold),
    k.z(102),
  ]);
  k.add([
    k.text(STR.bbMeterLabel, { size: 8 }),
    k.pos(4 + METER_W + 8, 13),
    k.color(k.rgb(140, 130, 150)),
    k.z(101),
  ]);

  // desno: TETA + pljas-pločice
  k.add([
    k.text("TETA", { size: 8 }),
    k.pos(k.width() - 4, 4),
    k.anchor("topright"),
    k.color(white),
    k.z(101),
  ]);
  const pips = Array.from({ length: swatsToWin }, (_, i) =>
    k.add([
      k.rect(7, 7),
      k.pos(k.width() - 12 - i * 11, 13),
      k.color(dark),
      k.outline(1, white),
      k.z(101),
    ]),
  );

  // sredina: runda i vrijeme jedno uz drugo u gornjem redu,
  // da se donji red ne sudara s natpisom PROVOKACIJA
  const roundText = k.add([
    k.text("", { size: 8 }),
    k.pos(k.width() / 2 - 4, 4),
    k.anchor("topright"),
    k.color(gold),
    k.z(101),
  ]);
  const timeText = k.add([
    k.text("", { size: 8 }),
    k.pos(k.width() / 2 + 4, 4),
    k.color(white),
    k.z(101),
  ]);

  return {
    setRound(round, total) {
      roundText.text = STR.round(round, total);
    },
    setTime(t) {
      const s = Math.max(0, Math.ceil(t));
      timeText.text = `0:${String(s).padStart(2, "0")}`;
      timeText.color = s <= 10 ? red : white;
    },
    setMeter(frac) {
      meterFill.width = Math.max(0.001, Math.min(1, frac) * METER_W);
    },
    setSwats(n) {
      pips.forEach((p, i) => {
        p.color = i < n ? red : dark;
      });
    },
  };
}
