// Baba i BUBA!!! — teta ima muholovku, Lovro glumi bubu i leti.
// Teta pobjeđuje s 3 pljasa. Lovro pobjeđuje mašući guzom UZ tetu
// (puni "provokaciju") ili bijegom do isteka vremena.
// U tekstu igre se NIKAD ne koriste "baba"/"buba" ni "twerk" —
// oni su uvijek Lovro i teta, a twerk je "mahanje guzom".

import { BABA_I_BUBA as BB } from "../../config.js";
import { session } from "../../state.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { babaBubaTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, choice } from "../../ui/banner.js";
import { buildLevel } from "../jedanDvaTri/level.js";
import { spawnFighter } from "../jedanDvaTri/fighter.js";
import { createMatch } from "../jedanDvaTri/rules.js";
import { createBabaCpu, createBubaCpu } from "./ai.js";
import { createHud } from "./hud.js";

const BABA_SPAWN = { x: 100, y: 164 };
const BUBA_SPAWN = { x: 270, y: 60 };

export function registerScene(k) {
  k.scene("babaIBuba", () => {
    const playerChar = session.playerCharacter; // "teta" → baba, "lovro" → buba
    const bubbleUp = { offset: k.vec2(0, -28) };
    const bubbleBug = bubbleUp; // Lovro je normalne veličine, samo glumi bubu

    buildLevel(k);

    // BABA — obična teta, ali s muholovkom u ruci
    const baba = spawnFighter(k, { character: "teta", pos: BABA_SPAWN, facing: 1 });
    const swatter = baba.add([
      k.sprite("muholovka"),
      k.pos(6, -14),
      k.anchor("bot"),
      k.rotate(25),
      k.z(-1),
    ]);
    swatter.onUpdate(() => {
      const f = baba.facing;
      const swinging = baba.slapCooldown > BB.swatCooldown - 0.18;
      swatter.pos = k.vec2(f * 7, -14);
      swatter.angle = f * (swinging ? 100 : 25);
    });

    // BUBA — obični Lovro koji se samo PONAŠA kao buba: leti mahanjem
    // "krila" (skok radi i u zraku) i twerka svojim pravim twerkom.
    const buba = k.add([
      k.sprite("lovro"),
      k.pos(BUBA_SPAWN.x, BUBA_SPAWN.y),
      k.anchor("bot"),
      k.area({ scale: k.vec2(0.62, 0.95), collisionIgnore: ["fighter"] }),
      k.body({ gravityScale: BB.bubaGravityScale }),
      k.opacity(1),
      k.z(10),
      "buba",
      {
        controller: null,
        facing: 1,
        invuln: 0,
        animLock: 0,
        frozen: true,
        twerking: false,
        celebrate: false,
        _anim: null,
        playIf(anim) {
          if (this._anim !== anim) {
            this._anim = anim;
            this.play(anim);
          }
        },
        playLocked(anim, t) {
          this._anim = anim;
          this.play(anim);
          this.animLock = t;
        },
        update() {
          const dt = k.dt();
          this.invuln = Math.max(0, this.invuln - dt);
          if (this.animLock > 0) this.animLock -= dt;
          this.opacity = this.invuln > 0 ? (Math.floor(k.time() * 14) % 2 === 0 ? 1 : 0.35) : 1;
          this.flipX = this.facing < 0;

          if (this.frozen) {
            if (this.animLock <= 0) this.playIf(this.celebrate ? "twerk" : "idle");
            return;
          }
          const c = this.controller;
          if (!c) return;

          let dir = 0;
          if (c.isDown("left")) dir -= 1;
          if (c.isDown("right")) dir += 1;
          if (dir !== 0) this.facing = dir;
          this.twerking = c.isDown("twerk");

          const speed = BB.bubaSpeed * (this.twerking ? BB.twerkSlowdown : 1);
          if (dir !== 0) this.move(dir * speed, 0);

          // mahni krilima — radi i u zraku, Lovro je sad buba
          if (c.consumePress("jump")) {
            this.vel = k.vec2(this.vel.x, -BB.bubaFlapForce);
          }

          // ostani na ekranu (i ispod HUD-a)
          this.pos.x = k.clamp(this.pos.x, 8, k.width() - 8);
          if (this.pos.y < 54) {
            this.pos.y = 54;
            this.vel = k.vec2(this.vel.x, Math.max(0, this.vel.y));
          }

          if (this.animLock <= 0) {
            let anim;
            if (this.twerking) anim = "twerk"; // maše guzom i u letu, naravno
            else if (!this.isGrounded()) anim = "jump";
            else if (dir !== 0) anim = "run";
            else anim = "idle";
            this.playIf(anim);
          }
        },
      },
    ]);
    buba.play("idle");

    // upravljanje: igrač dobiva svoju stranu, CPU drugu
    const kb = keyboardController(k);
    const babaCpu = createBabaCpu(k);
    const bubaCpu = createBubaCpu(k);
    const playerIsBaba = playerChar === "teta";
    baba.controller = playerIsBaba ? kb : babaCpu.ctrl;
    buba.controller = playerIsBaba ? bubaCpu.ctrl : kb;
    babaCpu.assign(baba, buba);
    bubaCpu.assign(buba, baba);

    const match = createMatch(BB);
    const hud = createHud(k, BB.swatsToWin);

    let phase = "intro"; // intro | playing | roundEnd
    let timeLeft = BB.roundTime;
    let swats = 0;
    let meter = 0;
    let angryStage = 0; // koliko se puta baba već naljutila (bubble pragovi)

    function setFrozen(v) {
      baba.frozen = v;
      buba.frozen = v;
    }

    function startRound() {
      phase = "intro";
      timeLeft = BB.roundTime;
      swats = 0;
      meter = 0;
      angryStage = 0;
      buba.celebrate = false;
      buba.twerking = false;
      buba.invuln = 0;
      baba.pos = k.vec2(BABA_SPAWN.x, BABA_SPAWN.y);
      buba.pos = k.vec2(BUBA_SPAWN.x, BUBA_SPAWN.y);
      buba.vel = k.vec2(0, 0);
      baba.facing = 1;
      buba.facing = -1;
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      hud.setSwats(0);
      hud.setMeter(0);
      setFrozen(true);

      banner(k, STR.round(match.round, match.maxRounds), {
        sub: playerIsBaba ? STR.bbIntroBaba : STR.bbIntroBuba,
      }).then(() => {
        phase = "playing";
        setFrozen(false);
      });

      if (!playerIsBaba && match.round === 1) {
        const hint = k.add([
          k.text(STR.bbFly, { size: 8 }),
          k.pos(k.width() / 2, 174),
          k.anchor("center"),
          k.color(140, 130, 150),
          k.z(150),
        ]);
        k.wait(5, () => hint.destroy());
      }
    }

    function trySwat() {
      if (baba.slapCooldown > 0) return;
      baba.slapCooldown = BB.swatCooldown;
      baba.playLocked("slap", 0.25);
      const sensor = k.add([
        k.rect(BB.swatReach, 26),
        k.opacity(0),
        k.pos(baba.pos.add(baba.facing * (8 + BB.swatReach / 2), -16)),
        k.anchor("center"),
        k.area(),
        k.lifespan(0.12),
        "swatSensor",
      ]);
      sensor.onCollide("buba", () => {
        onSwatHit();
        sensor.destroy();
      });
    }

    function onSwatHit() {
      if (phase !== "playing" || buba.invuln > 0) return;
      swats++;
      hud.setSwats(swats);
      floatText(k, buba.pos.add(0, -14), STR.bbSplat, "#d82810");
      buba.invuln = BB.hitInvulnTime;
      buba.spinT = 0.5;
      buba.vel = k.vec2(baba.facing * 150, -130);
      k.shake(3);
      if (swats >= BB.swatsToWin) {
        endRound("teta", "swat");
      } else if (Math.random() < 0.6) {
        say(k, baba, choice(babaBubaTaunts.babaSwat), bubbleUp);
      }
    }

    function endRound(winnerId, how) {
      phase = "roundEnd";
      setFrozen(true);
      match.recordRound(winnerId);

      let text;
      if (winnerId === "teta") {
        text = STR.bbBabaRound;
        baba.facing = Math.sign(baba.pos.x - buba.pos.x) || 1;
        baba.playLocked("twerk", 2.2); // i baba zna slaviti
      } else {
        text = how === "meter" ? STR.bbBubaMeterRound : STR.bbBubaTimeRound;
        buba.celebrate = true;
        say(k, buba, choice(babaBubaTaunts.buba), bubbleBug);
        baba.playLocked("annoyed", 2.2);
      }

      banner(k, text, { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "babaIBuba",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      babaCpu.update(dt);
      bubaCpu.update(dt);

      const wantSwat = baba.controller?.consumePress("slap");
      if (phase !== "playing") return;
      if (wantSwat && !baba.frozen) trySwat();

      timeLeft -= dt;
      hud.setTime(timeLeft);

      // provokacija: buba twerka dovoljno blizu babe
      if (buba.twerking && buba.invuln <= 0 && buba.pos.dist(baba.pos.add(0, -12)) <= BB.tauntRange) {
        meter += dt;
        hud.setMeter(meter / BB.tauntTime);
        if (Math.random() < 0.06) floatText(k, buba.pos.add(0, -12), "HIHI!", "#f8b820");
        const frac = meter / BB.tauntTime;
        if ((frac > 0.45 && angryStage === 0) || (frac > 0.8 && angryStage === 1)) {
          angryStage++;
          say(k, baba, choice(babaBubaTaunts.babaAngry), bubbleUp);
          baba.playLocked("annoyed", 0.7);
        }
        if (meter >= BB.tauntTime) {
          endRound("lovro", "meter");
          return;
        }
      }

      if (timeLeft <= 0) endRound("lovro", "time");
    });

    // buba zuji i provocira i sama od sebe
    k.loop(7, () => {
      if (phase === "playing" && Math.random() < 0.6) {
        say(k, buba, choice(babaBubaTaunts.buba), bubbleBug);
      }
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
