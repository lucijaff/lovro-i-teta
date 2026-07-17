// CPU za Astuk Bobu: teta ganja s jastukom (spor, dalekosežan zamah),
// Lovro bježi po sobi i vraća se provocirati — s brzim izmakom u bijegu.

import { ASTUK_BOBA as AB } from "../../config.js";
import { virtualController } from "../../input.js";

// Teta (CPU): trči za Lovrom, skače za njim na police, zamahuje jastukom.
export function createTetaCpu(k) {
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
    update(dt) {
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

      const dx = foe.pos.x - me.pos.x;
      ctrl.hold("left", dx < -4);
      ctrl.hold("right", dx > 4);
      const dyAbove = me.pos.y - foe.pos.y;
      if (Math.abs(dx) < 30 && dyAbove > 24 && dyAbove < 78 && me.isGrounded() && Math.random() < 0.7) {
        ctrl.press("jump");
      }
      if (Math.abs(dx) < AB.swingReach + 6 && Math.abs(dyAbove) < 26 && reactT <= 0) {
        ctrl.press("slap"); // zamahni!
        reactT = AB.ai.swingReactionMin + Math.random() * (AB.ai.swingReactionMax - AB.ai.swingReactionMin);
      }
    },
  };
}

// Lovro (CPU): luta, prilazi mahati guzom, bježi s izmakom kad zagusti.
export function createLovroCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let mode = "wander"; // wander | approach | flee
  let modeT = 0;
  let approachT = AB.ai.approachInterval;
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
      approachT = AB.ai.approachInterval * (0.6 + Math.random() * 0.8);
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

      const fleeAt = mode === "approach" ? AB.ai.fleeAtDive : AB.ai.fleeDistance;
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
          approachT = AB.ai.approachInterval * (0.7 + Math.random() * 0.8);
        }
      } else if (mode === "approach") {
        targetX = foe.pos.x + (me.pos.x > foe.pos.x ? 26 : -26);
        if (modeT <= 0) mode = "wander";
      } else if (mode === "flee") {
        if (modeT <= 0) mode = "wander";
      }

      const dx = targetX - me.pos.x;
      ctrl.hold("left", dx < -5);
      ctrl.hold("right", dx > 5);
      if (foeDist < 55 && Math.random() < 0.1 && me.isGrounded()) {
        ctrl.press("jump");
      }
      ctrl.hold("twerk", mode === "approach" && foeDist <= AB.tauntRange - 4);
    },
  };
}
