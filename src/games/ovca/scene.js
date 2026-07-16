// OVCA — Lovro je ovca (izgleda kao Lovro, bleji kao ovca), teta ga lovi,
// diže iznad glave i baca dolje. Bacanje bilo gdje = 1 bod, na KREVET = 2!
// Kad te zgrabi, zgrabila te — nema otimanja. Ali pretežak je da ga
// nosi dugo: nakon par sekundi isklizne.
// Lovro pobjeđuje mašući guzom uz tetu (provokacija) ili bijegom do isteka.

import { PHYSICS, OVCA } from "../../config.js";
import { session } from "../../state.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { ovcaTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, choice } from "../../ui/banner.js";
import { buildLevel, FIGHTER_SPAWNS } from "../jedanDvaTri/level.js";
import { spawnFighter } from "../jedanDvaTri/fighter.js";
import { createMatch } from "../jedanDvaTri/rules.js";
import { createHud } from "../babaIBuba/hud.js";
import { createTetaCpu, createOvcaCpu } from "./ai.js";

const BED_CENTER_X = 48; // sredina kreveta (pločice 1-4)

export function registerScene(k) {
  k.scene("ovca", () => {
    const playerChar = session.playerCharacter;
    const bubbleUp = { offset: k.vec2(0, -28) };

    buildLevel(k);

    const teta = spawnFighter(k, { character: "teta", pos: FIGHTER_SPAWNS.teta, facing: -1 });
    const lovro = spawnFighter(k, { character: "lovro", pos: FIGHTER_SPAWNS.lovro, facing: 1 });
    lovro.speedMul = OVCA.lovroSpeed / PHYSICS.moveSpeed; // ovca je brža

    const kb = keyboardController(k);
    const tetaCpu = createTetaCpu(k, BED_CENTER_X);
    const ovcaCpu = createOvcaCpu(k);
    const playerIsTeta = playerChar === "teta";
    teta.controller = playerIsTeta ? kb : tetaCpu.ctrl;
    lovro.controller = playerIsTeta ? ovcaCpu.ctrl : kb;
    tetaCpu.assign(teta, lovro);
    ovcaCpu.assign(lovro, teta);

    const match = createMatch(OVCA);
    const hud = createHud(k, OVCA.pointsToWin);

    let phase = "intro"; // intro | playing | roundEnd
    let timeLeft = OVCA.roundTime;
    let points = 0;
    let meter = 0;
    let angryStage = 0;
    let carrying = false;
    let carryT = 0;
    let thrown = false;
    let thrownAirT = 0;

    function setFrozen(v) {
      teta.frozen = v;
      lovro.frozen = v;
    }

    function releaseLovro({ escaped }) {
      carrying = false;
      teta.heldObject = null;
      lovro.animLock = 0;
      if (escaped) {
        // isklizne joj iz ruku i odskoči
        thrown = false;
        lovro.frozen = false;
        lovro.invuln = OVCA.hitInvulnTime;
        lovro.vel = k.vec2(-teta.facing * 100, -140);
        floatText(k, lovro.pos.add(0, -20), "BEEE!", "#f8b820");
      }
    }

    function startRound() {
      phase = "intro";
      timeLeft = OVCA.roundTime;
      points = 0;
      meter = 0;
      angryStage = 0;
      if (carrying) releaseLovro({ escaped: false });
      carrying = false;
      thrown = false;
      lovro.invuln = 0;
      lovro.animLock = 0;
      teta.heldObject = null;
      teta.pos = k.vec2(FIGHTER_SPAWNS.teta.x, FIGHTER_SPAWNS.teta.y);
      lovro.pos = k.vec2(FIGHTER_SPAWNS.lovro.x, FIGHTER_SPAWNS.lovro.y);
      teta.facing = -1;
      lovro.facing = 1;
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      hud.setSwats(0);
      hud.setMeter(0);
      setFrozen(true);

      banner(k, STR.round(match.round, match.maxRounds), {
        sub: playerIsTeta ? STR.ovIntroTeta : STR.bbIntroBuba,
      }).then(() => {
        phase = "playing";
        setFrozen(false);
      });

      if (playerIsTeta && match.round === 1) {
        const strip = k.add([
          k.rect(k.width(), 13),
          k.pos(0, k.height() - 13),
          k.color(26, 28, 44),
          k.opacity(0.85),
          k.z(149),
        ]);
        const hint = k.add([
          k.text(STR.ovGrabHint, { size: 8 }),
          k.pos(k.width() / 2, k.height() - 7),
          k.anchor("center"),
          k.color(244, 244, 244),
          k.z(150),
        ]);
        k.wait(5, () => {
          strip.destroy();
          hint.destroy();
        });
      }
    }

    function tryGrabOrThrow() {
      if (carrying) {
        // BACI! — pusti ga s malim lukom, bodovi se broje gdje SLETI
        teta.playLocked("slap", 0.25);
        say(k, teta, choice(ovcaTaunts.tetaThrow), bubbleUp);
        releaseLovro({ escaped: false });
        thrown = true;
        thrownAirT = 0;
        lovro.frozen = true; // dok leti, nema upravljanja
        lovro.playLocked("ouch", 9);
        lovro.vel = k.vec2(teta.facing * OVCA.throwVelX, OVCA.throwVelY);
        return;
      }
      if (teta.slapCooldown > 0) return;
      teta.slapCooldown = OVCA.grabCooldown;
      teta.playLocked("slap", 0.2);
      const close =
        Math.abs(teta.pos.x - lovro.pos.x) <= OVCA.grabRange &&
        Math.abs(teta.pos.y - lovro.pos.y) <= 24;
      if (close && lovro.invuln <= 0 && !thrown) {
        carrying = true;
        carryT = 0;
        teta.heldObject = lovro; // borac tada sam koristi "hold" animacije
        lovro.frozen = true;
        lovro.playLocked("ouch", 9);
        say(k, teta, choice(ovcaTaunts.tetaCatch), bubbleUp);
      }
    }

    function landThrow() {
      thrown = false;
      lovro.frozen = false;
      lovro.animLock = 0;
      lovro.playLocked("ouch", 0.4);
      lovro.invuln = OVCA.hitInvulnTime;
      const onBed = lovro.curPlatform()?.is("bed");
      const gained = onBed ? OVCA.bedPoints : OVCA.floorPoints;
      points = Math.min(OVCA.pointsToWin, points + gained);
      hud.setSwats(points);
      k.shake(3);
      floatText(k, lovro.pos.add(0, -28), STR.ovTres, "#d82810");
      if (onBed) floatText(k, lovro.pos.add(0, -40), STR.ovBedBonus, "#f8b820");
      if (points >= OVCA.pointsToWin) endRound("teta", "throw");
    }

    function endRound(winnerId, how) {
      phase = "roundEnd";
      if (carrying) releaseLovro({ escaped: false });
      thrown = false;
      setFrozen(true);
      match.recordRound(winnerId);

      let text;
      if (winnerId === "teta") {
        text = STR.ovThrowRound;
        teta.facing = Math.sign(teta.pos.x - lovro.pos.x) || 1;
        teta.playLocked("twerk", 2.2);
        lovro.playLocked("annoyed", 2.2);
      } else {
        text = how === "meter" ? STR.bbBubaMeterRound : STR.bbBubaTimeRound;
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || 1;
        lovro.playLocked("twerk", 2.2);
        teta.playLocked("annoyed", 2.2);
        say(k, lovro, choice(ovcaTaunts.lovro), bubbleUp);
      }

      banner(k, text, { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "ovca",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      tetaCpu.update(dt, { carrying, carryT });
      ovcaCpu.update(dt);

      const wantGrab = teta.controller?.consumePress("slap");
      lovro.controller?.consumePress("slap"); // ovca nema pljesak — samo počisti
      if (phase !== "playing") return;
      if (wantGrab && !teta.frozen) tryGrabOrThrow();

      // nošenje: ovca visi teti iznad glave dok je ne baci ili ne isklizne
      if (carrying) {
        carryT += dt;
        lovro.pos = teta.pos.add(0, -26);
        lovro.facing = teta.facing;
        lovro.vel = k.vec2(0, 0);
        if (carryT >= OVCA.carryMaxTime) releaseLovro({ escaped: true });
      }

      // bačena ovca: kad sleti, broje se bodovi (krevet vrijedi duplo)
      if (thrown) {
        thrownAirT += dt;
        if (thrownAirT > 0.15 && lovro.isGrounded()) landThrow();
      }

      timeLeft -= dt;
      hud.setTime(timeLeft);

      // dok maše guzom, Lovro se automatski okrene guzom prema teti
      const twerking =
        !carrying && !thrown && lovro.invuln <= 0 && lovro.controller?.isDown("twerk");
      if (twerking) {
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
      }

      // provokacija: Lovro maše guzom dovoljno blizu tete
      if (twerking && lovro.pos.dist(teta.pos) <= OVCA.tauntRange) {
        meter += dt;
        hud.setMeter(meter / OVCA.tauntTime);
        if (Math.random() < 0.06) floatText(k, lovro.pos.add(0, -30), "BEEE!", "#f8b820");
        const frac = meter / OVCA.tauntTime;
        if ((frac > 0.45 && angryStage === 0) || (frac > 0.8 && angryStage === 1)) {
          angryStage++;
          say(k, teta, choice(ovcaTaunts.tetaAngry), bubbleUp);
          teta.playLocked("annoyed", 0.7);
        }
        if (meter >= OVCA.tauntTime) {
          endRound("lovro", "meter");
          return;
        }
      }

      if (timeLeft <= 0) endRound("lovro", "time");
    });

    // ovca bleji i sama od sebe
    k.loop(7, () => {
      if (phase === "playing" && Math.random() < 0.6 && !carrying && !thrown) {
        say(k, lovro, choice(ovcaTaunts.lovro), bubbleUp);
      }
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
