// Borac (Lovro ili teta): kretanje, skakanje, animacije, guza-hitbox.
// Boraca pokreće "kontroler" (tipkovnica ili CPU) — borcu je svejedno tko.

import { PHYSICS, JEDAN_DVA_TRI as JDT } from "../../config.js";

export function spawnFighter(k, { character, pos, facing = 1 }) {
  const f = k.add([
    k.sprite(character),
    k.pos(pos.x, pos.y),
    k.anchor("bot"),
    k.area({ scale: k.vec2(0.62, 0.95), collisionIgnore: ["fighter", "pickup"] }),
    k.body({ jumpForce: PHYSICS.jumpForce }),
    k.opacity(1),
    k.z(10),
    "fighter",
    {
      character,
      controller: null, // postavlja scena
      facing,
      heldObject: null,
      slapCooldown: 0,
      invuln: 0, // nakon primljene pljeske kratko nedodirljiv
      speedMul: 1, // po-igri prilagodba brzine (npr. ovca je brža)
      animLock: 0,
      frozen: true,
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
        this.slapCooldown = Math.max(0, this.slapCooldown - dt);
        if (this.animLock > 0) this.animLock -= dt;
        this.flipX = this.facing < 0;

        // treperenje dok si nedodirljiv
        this.invuln = Math.max(0, this.invuln - dt);
        this.opacity = this.invuln > 0 ? (Math.floor(k.time() * 14) % 2 === 0 ? 1 : 0.35) : 1;

        // tijela nemaju trenje: vodoravna brzina (od izmaka/bacanja) gasi
        // se brzo na tlu, a polako i u zraku — luk ostaje, ali zaostala
        // brzina ne smije vječno pritiskati lika u zid.
        // Klampanje na ekran vrijedi i dok je lik smrznut.
        const friction = this.isGrounded() ? 10 : 2.5;
        this.vel = k.vec2(this.vel.x * Math.max(0, 1 - friction * dt), this.vel.y);
        this.pos.x = k.clamp(this.pos.x, 8, k.width() - 8);

        // sigurnosna mreža: ako lik IKAKO izađe s ekrana (ispod, iznad,
        // ili mu pozicija postane NaN), vrati ga u vidno polje da padne
        // natrag u sobu — nitko ne smije nestati
        const badX = !Number.isFinite(this.pos.x);
        const badY = !Number.isFinite(this.pos.y);
        if (badX || badY || this.pos.y > k.height() + 32 || this.pos.y < -60) {
          this.pos = k.vec2(
            badX ? k.width() / 2 : k.clamp(this.pos.x, 8, k.width() - 8),
            60,
          );
          this.vel = k.vec2(0, 0);
        }

        if (this.frozen) {
          if (this.animLock <= 0) this.playIf(this.heldObject ? "hold" : "idle");
          return;
        }

        const c = this.controller;
        if (!c) return;

        let dir = 0;
        if (c.isDown("left")) dir -= 1;
        if (c.isDown("right")) dir += 1;
        if (dir !== 0) this.facing = dir;

        // igrač koji drži SUPROTAN smjer brzo gasi zaostalu brzinu —
        // upravljanje uvijek pobjeđuje ostatke izmaka/bacanja
        if (dir !== 0 && Math.sign(this.vel.x) === -dir) {
          this.vel = k.vec2(this.vel.x * Math.max(0, 1 - 14 * dt), this.vel.y);
        }

        const speed = PHYSICS.moveSpeed * this.speedMul * (this.heldObject ? JDT.holdSlowdown : 1);
        if (dir !== 0) this.move(dir * speed, 0);

        if (c.consumePress("jump") && this.isGrounded()) {
          const onBed = this.curPlatform()?.is("bed");
          this.jump(PHYSICS.jumpForce * (onBed ? PHYSICS.bedBounce : 1));
        }

        if (this.animLock <= 0) {
          const held = !!this.heldObject;
          let anim;
          if (!this.isGrounded()) anim = held ? "hold" : "jump";
          else if (dir !== 0) anim = held ? "holdrun" : "run";
          else if (c.isDown("twerk")) anim = "twerk"; // provokacija guzom!
          else anim = held ? "hold" : "idle";
          this.playIf(anim);
        }
      },
    },
  ]);

  // Guza-hitbox: mala zona na STRAŽNJOJ strani (suprotno od smjera gledanja).
  // Pljeska vrijedi samo ako pogodi baš nju — mora se doći iza!
  const butt = f.add([
    k.rect(7, 9),
    k.opacity(0),
    k.pos(-facing * 6, -12),
    k.anchor("center"),
    k.area(),
    "butt",
    { owner: f },
  ]);
  butt.onUpdate(() => {
    butt.pos = k.vec2(-f.facing * 6, -12);
  });

  return f;
}
