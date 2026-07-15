// Predmeti za imunost: trkač koji drži predmet ne može biti valjano pljesnut.
// Ali: predmet se raspadne nakon nekoliko sekundi i usporava trkača,
// pa se ne isplati vječno čučati u kutu.

import { JEDAN_DVA_TRI as JDT } from "../../config.js";
import { OBJECTS } from "../../sprites/objects.js";

export function createPickups(k, spawnPoints, events = {}) {
  let items = [];

  function shuffled(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function spawnItem(kind, point) {
    const item = k.add([
      k.sprite(kind),
      k.pos(point.x, point.y),
      k.anchor("bot"),
      k.area(),
      k.opacity(1),
      k.z(5),
      "pickup",
      {
        kind,
        holder: null,
        holdTime: 0,
        regrabUntil: 0,
      },
    ]);
    items.push(item);
    return item;
  }

  function crumble(item) {
    if (item.holder) {
      item.holder.heldObject = null;
      item.holder = null;
    }
    // raspad u pikselčiće
    for (let i = 0; i < 7; i++) {
      const dir = k.vec2(Math.cos((i / 7) * Math.PI * 2), Math.sin((i / 7) * Math.PI * 2));
      k.add([
        k.rect(2, 2),
        k.pos(item.pos.add(0, -4)),
        k.color(244, 244, 244),
        k.opacity(1),
        k.move(dir, 45),
        k.lifespan(0.4, { fade: 0.4 }),
        k.z(60),
      ]);
    }
    const kind = item.kind;
    items = items.filter((i) => i !== item);
    item.destroy();
    events.onCrumble?.(item);
    // novi se pojavi malo kasnije, na nekom slobodnom mjestu
    k.wait(JDT.objectRespawnTime, () => {
      const free = shuffled(spawnPoints).find(
        (p) => !items.some((i) => !i.holder && i.pos.dist(k.vec2(p.x, p.y)) < 10),
      );
      if (free) spawnItem(kind, free);
    });
  }

  return {
    reset() {
      for (const i of items) i.destroy();
      items = [];
      const points = shuffled(spawnPoints);
      OBJECTS.slice(0, JDT.objectCount).forEach((o, idx) => spawnItem(o.id, points[idx]));
    },

    // Trkač pritisne "uzmi/pusti".
    tryGrab(runner) {
      const now = k.time();
      if (runner.heldObject) {
        // pusti
        const item = runner.heldObject;
        item.holder = null;
        item.holdTime = 0;
        item.regrabUntil = now + JDT.regrabCooldown;
        item.pos = k.vec2(runner.pos.x, runner.pos.y);
        item.opacity = 1;
        runner.heldObject = null;
        return "dropped";
      }
      const item = items.find(
        (i) => !i.holder && now >= i.regrabUntil && i.pos.dist(runner.pos) <= JDT.grabRange,
      );
      if (!item) return null;
      item.holder = runner;
      item.holdTime = 0;
      runner.heldObject = item;
      return "grabbed";
    },

    nearestFree(pos) {
      const now = k.time();
      let best = null;
      let bestD = Infinity;
      for (const i of items) {
        if (i.holder || now < i.regrabUntil) continue;
        const d = i.pos.dist(pos);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    },

    update(dt) {
      for (const item of [...items]) {
        if (!item.holder) continue;
        item.holdTime += dt;
        // lebdi iznad glave držača
        item.pos = item.holder.pos.add(0, -28);
        const left = JDT.holdCrumbleTime - item.holdTime;
        if (left <= 0) {
          crumble(item);
        } else if (left <= JDT.holdBlinkTime) {
          item.opacity = Math.floor(k.time() * 10) % 2 === 0 ? 1 : 0.25;
        }
      }
    },

    dropAll() {
      for (const item of items) {
        if (item.holder) {
          item.holder.heldObject = null;
          item.holder = null;
          item.holdTime = 0;
          item.opacity = 1;
        }
      }
    },
  };
}
