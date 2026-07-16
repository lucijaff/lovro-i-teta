// CPU za Baba i BUBA!!! — dvije potpuno različite pameti:
// baba ganja i maše muholovkom, buba leti okolo i spušta se provocirati.

import { BABA_I_BUBA as BB } from "../../config.js";
import { virtualController } from "../../input.js";

// Baba (CPU): trči ispod bube, skače i maše kad je buba blizu.
export function createBabaCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null; // buba
  let tickT = 0;
  let reactT = 0;
  let lastX = 0;
  let stuckT = 0;

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
      reactT = 0;
    },
    update(dt) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      tickT -= dt;
      reactT -= dt;

      // zapela → skoči
      const wantsMove = ctrl.isDown("left") || ctrl.isDown("right");
      if (wantsMove && Math.abs(me.pos.x - lastX) < 8 * dt) stuckT += dt;
      else stuckT = 0;
      lastX = me.pos.x;
      if (stuckT > 0.35 && me.isGrounded()) {
        ctrl.press("jump");
        stuckT = 0;
      }

      if (tickT > 0) return;
      tickT = 0.22 + Math.random() * 0.12;

      const dx = foe.pos.x - me.pos.x;
      const dyAbove = me.pos.y - foe.pos.y; // koliko je buba iznad babinih nogu
      ctrl.hold("left", dx < -4);
      ctrl.hold("right", dx > 4);

      // buba je iznad, ali dohvatljiva skokom
      if (Math.abs(dx) < 26 && dyAbove > 24 && dyAbove < 78 && me.isGrounded() && Math.random() < 0.7) {
        ctrl.press("jump");
      }
      // zamahni kad je buba u dosegu (i malo prerano, jer je baba nervozna)
      if (Math.abs(dx) < BB.swatReach + 8 && dyAbove > -8 && dyAbove < 40) {
        if (reactT <= 0) {
          ctrl.press("slap");
          reactT = BB.ai.swatReactionMin + Math.random() * (BB.ai.swatReactionMax - BB.ai.swatReactionMin);
        }
      }
    },
  };
}

// Buba (CPU): leti po sobi, a svakih par sekundi se spusti do babe twerkati.
export function createBubaCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null; // baba
  let mode = "wander"; // wander | dive | flee
  let target = { x: 160, y: 70 };
  let modeT = 0;
  let diveT = BB.ai.diveInterval;
  let flapT = 0;

  function pickWander() {
    target = { x: 30 + Math.random() * 260, y: 45 + Math.random() * 60 };
  }

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
      mode = "wander";
      diveT = BB.ai.diveInterval * (0.6 + Math.random() * 0.8);
      pickWander();
    },
    update(dt) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      modeT -= dt;
      diveT -= dt;
      flapT -= dt;

      const foeDist = me.pos.dist(foe.pos);

      // teta preblizu → bijeg, s naglim izmakom (X) za start
      if (mode !== "flee" && foeDist < BB.ai.fleeDistance) {
        mode = "flee";
        modeT = 1.2;
        target = { x: me.pos.x < 160 ? 290 : 30, y: 45 };
        me.facing = Math.sign(me.pos.x - foe.pos.x) || 1;
        ctrl.press("slap"); // BZZZUM!
      }

      if (mode === "wander") {
        if (modeT <= 0) {
          modeT = 1.5;
          pickWander();
        }
        if (diveT <= 0) {
          mode = "dive";
          modeT = 3;
          diveT = BB.ai.diveInterval * (0.7 + Math.random() * 0.8);
        }
      } else if (mode === "dive") {
        // sleti do tete i maši joj guzom pred nosom
        target = { x: foe.pos.x + (me.pos.x > foe.pos.x ? 24 : -24), y: foe.pos.y - 14 };
        if (modeT <= 0) {
          mode = "wander";
          pickWander();
        }
      } else if (mode === "flee") {
        if (modeT <= 0) {
          mode = "wander";
          pickWander();
        }
      }

      // upravljanje prema cilju
      const dx = target.x - me.pos.x;
      ctrl.hold("left", dx < -5);
      ctrl.hold("right", dx > 5);
      // maši krilima: kad je ispod cilja ili počne padati prebrzo
      if (flapT <= 0 && (me.pos.y > target.y + 4 || me.vel.y > 70)) {
        ctrl.press("jump");
        flapT = 0.14;
      }
      // maši guzom kad si u zoni provokacije
      ctrl.hold("twerk", mode === "dive" && me.pos.dist(foe.pos) <= BB.tauntRange - 4);
    },
  };
}
