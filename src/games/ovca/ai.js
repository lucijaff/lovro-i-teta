// CPU za OVCU: teta lovi, hvata i nosi prema krevetu; Lovro-ovca bježi
// po podu i policama pa se vraća provocirati. Priglupo, kao i uvijek.

import { OVCA } from "../../config.js";
import { virtualController } from "../../input.js";

// Teta (CPU): ganja ovcu; kad je ulovi, nosi je prema krevetu ako je blizu,
// inače baci na mjestu. Baci svakako prije nego što ovca isklizne.
export function createTetaCpu(k, bedX) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
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
    // ctx: { carrying: bool, carryT: number }
    update(dt, ctx) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      tickT -= dt;
      reactT -= dt;

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

      if (ctx.carrying) {
        // nosi ovcu: prema krevetu ako stigne, inače baci gdje jest
        const dxBed = bedX - me.pos.x;
        const nearBed = Math.abs(dxBed) < 14;
        const almostSlipping = ctx.carryT > OVCA.carryMaxTime - 0.7;
        const bedTooFar = Math.abs(dxBed) > 110;
        if (nearBed || almostSlipping || bedTooFar) {
          ctrl.press("slap"); // baci!
          ctrl.hold("left", false);
          ctrl.hold("right", false);
        } else {
          ctrl.hold("left", dxBed < 0);
          ctrl.hold("right", dxBed > 0);
        }
        return;
      }

      // lovi ovcu
      const dx = foe.pos.x - me.pos.x;
      ctrl.hold("left", dx < -4);
      ctrl.hold("right", dx > 4);
      const dyAbove = me.pos.y - foe.pos.y;
      if (Math.abs(dx) < 30 && dyAbove > 24 && dyAbove < 78 && me.isGrounded() && Math.random() < 0.7) {
        ctrl.press("jump"); // ovca je na polici — skoči za njom
      }
      if (Math.abs(dx) < OVCA.grabRange + 4 && Math.abs(dyAbove) < 24 && reactT <= 0) {
        ctrl.press("slap"); // ulovi!
        reactT = OVCA.ai.grabReactionMin + Math.random() * (OVCA.ai.grabReactionMax - OVCA.ai.grabReactionMin);
      }
    },
  };
}

// Lovro-ovca (CPU): bježi po podu, skače na police, pa se vraća mahati guzom.
export function createOvcaCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let mode = "wander"; // wander | approach | flee
  let modeT = 0;
  let approachT = OVCA.ai.approachInterval;
  let targetX = 160;
  let tickT = 0;
  let lastX = 0;
  let stuckT = 0;

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
      mode = "wander";
      approachT = OVCA.ai.approachInterval * (0.6 + Math.random() * 0.8);
      targetX = 30 + Math.random() * 260;
    },
    update(dt) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      modeT -= dt;
      approachT -= dt;
      tickT -= dt;

      const wantsMove = ctrl.isDown("left") || ctrl.isDown("right");
      if (wantsMove && Math.abs(me.pos.x - lastX) < 8 * dt) stuckT += dt;
      else stuckT = 0;
      lastX = me.pos.x;
      if (stuckT > 0.35 && me.isGrounded()) {
        ctrl.press("jump");
        stuckT = 0;
      }

      if (tickT > 0) return;
      tickT = 0.2 + Math.random() * 0.12;
      ctrl.hold("twerk", false);

      const dxFoe = me.pos.x - foe.pos.x;
      const foeDist = Math.abs(dxFoe);

      // teta preblizu → bjež'!
      const fleeAt = mode === "approach" ? OVCA.ai.fleeAtDive : OVCA.ai.fleeDistance;
      if (mode !== "flee" && foeDist < fleeAt) {
        mode = "flee";
        modeT = 1.3;
        targetX = me.pos.x < 160 ? 290 : 30;
        me.facing = Math.sign(targetX - me.pos.x) || 1;
        ctrl.press("slap"); // HOP! — brzi izmak u bijeg
      }

      if (mode === "wander") {
        if (modeT <= 0) {
          modeT = 1.6;
          targetX = 30 + Math.random() * 260;
        }
        if (approachT <= 0) {
          mode = "approach";
          modeT = 3;
          approachT = OVCA.ai.approachInterval * (0.7 + Math.random() * 0.8);
        }
      } else if (mode === "approach") {
        targetX = foe.pos.x + (me.pos.x > foe.pos.x ? 24 : -24);
        if (modeT <= 0) mode = "wander";
      } else if (mode === "flee") {
        if (modeT <= 0) mode = "wander";
      }

      const dx = targetX - me.pos.x;
      ctrl.hold("left", dx < -5);
      ctrl.hold("right", dx > 5);
      if (foeDist < 55 && Math.random() < 0.1 && me.isGrounded()) {
        ctrl.press("jump"); // panični skokić
      }
      // maši guzom kad si u zoni provokacije
      ctrl.hold("twerk", mode === "approach" && foeDist <= OVCA.tauntRange - 4);
    },
  };
}
