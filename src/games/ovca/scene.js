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
    let leapCd = 0;

    function setFrozen(v) {
      teta.frozen = v;
      lovro.frozen = v;
    }

    function releaseLovro({ escaped }) {
      carrying = false;
      teta.heldObject = null;
      lovro.animLock = 0;
      lovro.z = 10;
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
      teta.vel = k.vec2(0, 0);
      lovro.vel = k.vec2(0, 0);
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

      if (match.round === 1) {
        const strip = k.add([
          k.rect(k.width(), 13),
          k.pos(0, k.height() - 13),
          k.color(26, 28, 44),
          k.opacity(0.85),
          k.z(149),
        ]);
        const hint = k.add([
          k.text(playerIsTeta ? STR.ovGrabHint : STR.ovLeapHint, { size: 8 }),
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
      teta.playLocked("slap", 0.35);
      // vidljiv zamah: bljesak pokazuje TOČNO dokle hvatanje seže
      k.add([
        k.rect(OVCA.grabRange, 24, { radius: 2 }),
        k.pos(teta.pos.add(teta.facing * (6 + OVCA.grabRange / 2), -12)),
        k.anchor("center"),
        k.color(244, 244, 244),
        k.opacity(0.35),
        k.z(60),
        k.lifespan(0.18, { fade: 0.18 }),
      ]);
      const close =
        Math.abs(teta.pos.x - lovro.pos.x) <= OVCA.grabRange &&
        Math.abs(teta.pos.y - lovro.pos.y) <= 24;
      if (close && lovro.invuln <= 0 && !thrown) {
        carrying = true;
        carryT = 0;
        teta.heldObject = lovro; // borac tada sam koristi "hold" animacije
        lovro.frozen = true;
        lovro.z = 11; // ISPRED tete dok ga nosi, da se uvijek vidi
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
      const wantLeap = lovro.controller?.consumePress("slap");
      if (phase !== "playing") return;
      if (wantGrab && !teta.frozen) tryGrabOrThrow();

      // BRZI IZMAK (X): ovčji skok u stranu s trenom nedodirljivosti.
      // Smjer: strelice koje igrač DRŽI, a tek ako ništa ne drži — facing
      // (facing zna biti okrenut auto-mahanjem guzom prema teti).
      leapCd = Math.max(0, leapCd - dt);
      if (wantLeap && !lovro.frozen && !carrying && !thrown && leapCd <= 0) {
        const c = lovro.controller;
        let leapDir = 0;
        if (c.isDown("left")) leapDir -= 1;
        if (c.isDown("right")) leapDir += 1;
        // bez strelica: izmak je BIJEG — skoči OD tete, ne "kud gledaš"
        if (leapDir === 0) leapDir = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
        lovro.facing = leapDir;
        leapCd = OVCA.leapCooldown;
        lovro.vel = k.vec2(leapDir * OVCA.leapSpeed, -OVCA.leapJump);
        lovro.invuln = Math.max(lovro.invuln, OVCA.leapInvuln);
        floatText(k, lovro.pos.add(-leapDir * 10, -20), "HOP!", "#40d8d0");
      }

      // nošenje: ovca visi teti pod rukom, sa strane, dok je ne baci
      // ili dok joj ne isklizne
      if (carrying) {
        carryT += dt;
        // klampano da nošenje uz rub ne gurne ovcu izvan ekrana
        lovro.pos = k.vec2(
          k.clamp(teta.pos.x + teta.facing * 12, 8, k.width() - 8),
          teta.pos.y - 14,
        );
        lovro.facing = teta.facing;
        lovro.vel = k.vec2(0, 0);
        if (carryT >= OVCA.carryMaxTime) releaseLovro({ escaped: true });
      }

      // bačena ovca: kad sleti, broje se bodovi (krevet vrijedi duplo).
      // Ako slijetanje iz bilo kojeg razloga ne sjedne u 2s, bacanje se
      // svejedno razriješi — nitko ne smije ostati zamrznut u letu.
      if (thrown) {
        thrownAirT += dt;
        if ((thrownAirT > 0.15 && lovro.isGrounded()) || thrownAirT > 2) landThrow();
      }

      timeLeft -= dt;
      hud.setTime(timeLeft);

      // dok maše guzom, Lovro se automatski okrene guzom prema teti
      const twerking =
        !carrying && !thrown && lovro.invuln <= 0 && lovro.controller?.isDown("twerk");
      if (twerking) {
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
      }

      // provokacija: Lovro maše guzom dovoljno blizu tete.
      // Što bliže, to brže puni (do 2×) — hrabrost se isplati!
      const tetaDist = lovro.pos.dist(teta.pos);
      if (twerking && tetaDist <= OVCA.tauntRange) {
        meter += dt * (2 - tetaDist / OVCA.tauntRange);
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
