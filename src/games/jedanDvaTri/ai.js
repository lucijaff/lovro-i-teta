// CPU protivnik: namjerno priglup i smiješan. Odlučuje svakih ~0.3s,
// pa kasni, promašuje i paničari — to je štos. Težina se štima u config.js.
//
// Nema uloga: CPU istovremeno napada (dođi iza, pljesni), brani se
// (bježi kad je protivnik imun), grabi predmete i — naravno — twerka.

import { AI, JEDAN_DVA_TRI as JDT } from "../../config.js";
import { virtualController } from "../../input.js";

export function createCpu(k, cfg = AI) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let tickT = 0;
  let reactT = 0;
  let hesitateT = 0;
  let lastX = 0;
  let stuckT = 0;

  function moveToward(x, deadzone = 3) {
    const dx = x - me.pos.x;
    ctrl.hold("left", dx < -deadzone);
    ctrl.hold("right", dx > deadzone);
  }

  function moveDir(dir) {
    ctrl.hold("left", dir < 0);
    ctrl.hold("right", dir > 0);
  }

  function think(ctx) {
    ctrl.hold("twerk", false);
    const dxFoe = me.pos.x - foe.pos.x;
    const foeDist = Math.abs(dxFoe);
    const iHold = !!me.heldObject;
    const foeImmune = !!foe.heldObject;

    // siguran s predmetom u rukama i daleko? provokacija guzom
    if (iHold && foeDist > 90 && Math.random() < 0.4) {
      moveDir(0);
      // okreni se od protivnika — guza maše ravno prema njemu
      me.facing = Math.sign(dxFoe) || 1;
      ctrl.hold("twerk", true);
      return;
    }

    // protivnik je imun, a ja nisam: zgrabi i sam nešto, ili drži razmak
    if (foeImmune && !iHold) {
      const obj = ctx?.pickups?.nearestFree(me.pos);
      if (obj) {
        moveToward(obj.pos.x, 2);
        if (obj.pos.y < me.pos.y - 20 && me.isGrounded() && Math.random() < 0.7) {
          ctrl.press("jump");
        }
        if (me.pos.dist(obj.pos) <= JDT.grabRange - 2) ctrl.press("grab");
        return;
      }
      if (foeDist < 70) {
        // drži razmak dok mu se predmet ne raspadne
        let dir = Math.sign(dxFoe) || 1;
        const cornered =
          (me.pos.x < cfg.cornerDistance && dir < 0) ||
          (me.pos.x > 320 - cfg.cornerDistance && dir > 0);
        if (cornered) {
          dir = -dir;
          if (me.isGrounded()) ctrl.press("jump");
        }
        moveDir(dir);
        if (Math.random() < cfg.panicHopChance && me.isGrounded()) ctrl.press("jump");
        return;
      }
      moveDir(0);
      return;
    }

    // ponekad zgrabi predmet koji je baš pri ruci (obrana unaprijed)
    if (!iHold && ctx?.pickups && Math.random() < 0.25) {
      const obj = ctx.pickups.nearestFree(me.pos);
      if (obj && me.pos.dist(obj.pos) <= JDT.grabRange - 2) ctrl.press("grab");
    }

    // obrana: protivnik mi je za guzom — panični skok preko njega
    const foeBehindMe = Math.sign(foe.pos.x - me.pos.x) === -Math.sign(me.facing);
    if (foeDist < 20 && foeBehindMe && Math.random() < 0.5) {
      if (me.isGrounded()) ctrl.press("jump");
      moveDir(Math.sign(dxFoe) || 1);
      return;
    }

    // napad: ciljaj točku IZA protivnika (guza je otraga!)
    moveToward(foe.pos.x - foe.facing * 8);
    const dy = foe.pos.y - me.pos.y;
    if (dy < -24 && me.isGrounded() && Math.random() < 0.6) ctrl.press("jump");

    if (foeDist < 24 && Math.abs(dy) < 22) {
      if (foeImmune && Math.random() < cfg.hesitateChance) {
        hesitateT = cfg.hesitateTime; // "hm, drži nešto..."
        return;
      }
      if (reactT <= 0) {
        ctrl.press("slap");
        reactT = cfg.slapReactionMin + Math.random() * (cfg.slapReactionMax - cfg.slapReactionMin);
      }
    }
  }

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
      hesitateT = 0;
      reactT = 0;
      stuckT = 0;
    },
    update(dt, ctx) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      tickT -= dt;
      reactT -= dt;
      hesitateT -= dt;

      // zapeo u zid/rub → skoči (stalna provjera, ne čeka tick)
      const wantsMove = ctrl.isDown("left") || ctrl.isDown("right");
      if (wantsMove && Math.abs(me.pos.x - lastX) < 8 * dt) stuckT += dt;
      else stuckT = 0;
      lastX = me.pos.x;
      if (stuckT > 0.35 && me.isGrounded()) {
        ctrl.press("jump");
        stuckT = 0;
      }

      if (tickT > 0) return;
      tickT = cfg.tickTime + Math.random() * cfg.tickJitter;

      if (hesitateT > 0) {
        moveDir(0);
        return;
      }
      think(ctx);
    },
  };
}
