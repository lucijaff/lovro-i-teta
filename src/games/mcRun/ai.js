// CPU za MC Run: Lovro s Maksom uporno ganja; teta bježi od mačke
// s puno panike, izmacima i skokovima na police.

import { MC_RUN as MC } from "../../config.js";
import { virtualController } from "../../input.js";

// Lovro (CPU): samo trči prema teti — dodir radi sve.
export function createLovroCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let tickT = 0;
  let lastX = 0;
  let stuckT = 0;

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
    },
    update(dt) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
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
      tickT = 0.2 + Math.random() * 0.1;

      const dx = foe.pos.x - me.pos.x;
      ctrl.hold("left", dx < -3);
      ctrl.hold("right", dx > 3);
      const dyAbove = me.pos.y - foe.pos.y;
      if (Math.abs(dx) < 34 && dyAbove > 24 && dyAbove < 78 && me.isGrounded() && Math.random() < 0.75) {
        ctrl.press("jump"); // za njom na policu!
      }
    },
  };
}

// Teta (CPU): drži VELIKI razmak od mačke, paničari, izmiče se.
export function createTetaCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let tickT = 0;
  let wanderX = 160;
  let wanderT = 0;
  let lastX = 0;
  let stuckT = 0;

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
    },
    update(dt) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      tickT -= dt;
      wanderT -= dt;

      const wantsMove = ctrl.isDown("left") || ctrl.isDown("right");
      if (wantsMove && Math.abs(me.pos.x - lastX) < 8 * dt) stuckT += dt;
      else stuckT = 0;
      lastX = me.pos.x;
      if (stuckT > 0.35 && me.isGrounded()) {
        ctrl.press("jump");
        stuckT = 0;
      }

      if (tickT > 0) return;
      tickT = 0.18 + Math.random() * 0.1;

      const dxFoe = me.pos.x - foe.pos.x;
      const foeDist = Math.abs(dxFoe);

      if (foeDist < MC.ai.fleeDistance) {
        let dir = Math.sign(dxFoe) || 1;
        const cornered = (me.pos.x < 30 && dir < 0) || (me.pos.x > 290 && dir > 0);
        if (cornered && foeDist < 70) {
          // stjerana u kut — izmak preko Lovre i mačke!
          dir = -dir;
          me.facing = dir;
          ctrl.press("slap"); // BRZI IZMAK
          if (me.isGrounded()) ctrl.press("jump");
        }
        ctrl.hold("left", dir < 0);
        ctrl.hold("right", dir > 0);
        if (foeDist < MC.ai.panicDistance && Math.random() < 0.15 && me.isGrounded()) {
          ctrl.press("jump"); // panični skok (i na police)
        }
      } else {
        if (wanderT <= 0) {
          wanderT = 1.5;
          wanderX = 30 + Math.random() * 260;
        }
        const dx = wanderX - me.pos.x;
        ctrl.hold("left", dx < -6);
        ctrl.hold("right", dx > 6);
      }
    },
  };
}
