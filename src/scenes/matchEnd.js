// Kraj meča: pobjednik slavi, gubitnik se duri.

import { STR } from "../strings.js";
import { CHARACTERS, otherCharacter } from "../sprites/characters.js";
import { gameTaunts } from "../taunts.js";
import { say } from "../ui/bubble.js";
import { choice } from "../ui/banner.js";

export function registerMatchEndScene(k) {
  k.scene("matchEnd", ({ winner, scores, gameId }) => {
    const gold = k.rgb(248, 216, 120);
    const white = k.rgb(244, 244, 244);
    const dim = k.rgb(140, 130, 150);
    const loser = otherCharacter(winner);

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(36, 28, 46), k.z(-20)]);
    for (let x = 0; x < 20; x++) {
      k.add([k.sprite("floor"), k.pos(x * 16, 148), k.z(-10)]);
    }

    k.add([
      k.text(STR.matchWin(CHARACTERS[winner].title), { size: 12, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 22),
      k.anchor("center"),
      k.color(gold),
    ]);
    k.add([
      k.text(`LOVRO ${scores.lovro} - ${scores.teta} TETA`, { size: 8, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 38),
      k.anchor("center"),
      k.color(white),
    ]);
    const winnerSprite = k.add([
      k.sprite(winner),
      k.pos(130, 148),
      k.anchor("bot"),
      k.scale(3),
    ]);
    winnerSprite.play("idle");
    // pobjednik poskakuje od sreće
    winnerSprite.onUpdate(() => {
      winnerSprite.pos.y = 148 - Math.abs(Math.sin(k.time() * 4)) * 8;
    });

    const loserSprite = k.add([
      k.sprite(loser),
      k.pos(215, 148),
      k.anchor("bot"),
      k.scale(2),
    ]);
    loserSprite.play("annoyed");
    loserSprite.flipX = true;

    k.wait(0.6, () => say(k, winnerSprite, choice(gameTaunts.roundWin), { offset: k.vec2(0, -76) }));

    // opcije
    let selected = 0;
    const opts = [
      { label: STR.again, go: () => k.go(gameId) },
      { label: STR.toMenu, go: () => k.go("menu") },
    ];
    const items = opts.map((o, i) =>
      k.add([
        k.text("", { size: 8 }),
        k.pos(k.width() / 2, 160 + i * 11),
        k.anchor("center"),
        k.color(white),
      ]),
    );
    function refresh() {
      items.forEach((item, i) => {
        item.text = i === selected ? `> ${opts[i].label} <` : opts[i].label;
        item.color = i === selected ? gold : white;
      });
    }
    refresh();
    for (const key of ["up", "w"]) k.onKeyPress(key, () => { selected = (selected + 1) % 2; refresh(); });
    for (const key of ["down", "s"]) k.onKeyPress(key, () => { selected = (selected + 1) % 2; refresh(); });
    for (const key of ["enter", "space"]) k.onKeyPress(key, () => opts[selected].go());
    k.onKeyPress("escape", () => k.go("menu"));
  });
}
