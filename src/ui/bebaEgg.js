// Skriveno iznenađenje: igrač koji igra LOVRU utipka "beba" → Lovro stane
// usred igre, izdere se TI SI BEBAAAAA!, konfeti, trese se ekran, maše
// guzom, a teta pobjesni. Nikakva prednost — dapače, dok slavi, lako ga
// je uloviti. Ali vrijedi. Radi u svakoj igri.

import { say } from "./bubble.js";
import { flashText } from "./banner.js";
import { bebaEgg } from "../taunts.js";

const CONFETTI = ["#f8b820", "#d82810", "#40d8d0", "#c84cb0", "#38b764"];

// lovro/teta: bilo koji objekt s pos, facing, playLocked (borac ili buba).
// enabled: samo kad igrač stvarno upravlja Lovrom.
export function installBebaEgg(k, { lovro, teta, enabled }) {
  if (!enabled) return;
  let buffer = "";
  let cooldown = 0;

  k.onUpdate(() => {
    cooldown = Math.max(0, cooldown - k.dt());
  });

  k.onKeyPress((key) => {
    if (typeof key !== "string" || key.length !== 1 || key < "a" || key > "z") return;
    buffer = (buffer + key).slice(-4);
    if (buffer === "beba" && cooldown <= 0) {
      cooldown = 6;
      trigger();
    }
  });

  function trigger() {
    // Lovro sve ispusti i slavi (i potpuno je ranjiv — takva su pravila)
    lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
    lovro.playLocked?.("twerk", 1.8);
    say(k, lovro, bebaEgg.lovro, { offset: k.vec2(0, -30) });
    k.shake(5);

    // veliki bljeskajući natpis preko sredine
    flashText(k, "BEBA!!!");

    // konfeti iz Lovre
    for (let i = 0; i < 22; i++) {
      const ang = Math.random() * Math.PI * 2;
      k.add([
        k.rect(2, 2),
        k.pos(lovro.pos.add(0, -14)),
        k.color(k.Color.fromHex(CONFETTI[i % CONFETTI.length])),
        k.opacity(1),
        k.move(k.vec2(Math.cos(ang), Math.sin(ang) - 0.6), 60 + Math.random() * 60),
        k.lifespan(0.9, { fade: 0.6 }),
        k.z(300),
      ]);
    }

    // teta, naravno, pobjesni
    k.wait(0.6, () => {
      if (!teta.exists()) return;
      teta.playLocked?.("annoyed", 1.5);
      say(k, teta, bebaEgg.teta, { offset: k.vec2(0, -30) });
    });
  }
}
