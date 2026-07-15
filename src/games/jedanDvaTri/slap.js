// Pljeska: kratkotrajni senzor ispred pljeskača + brojanje niza JEDAN-DVA-TRI.

import { JEDAN_DVA_TRI as JDT } from "../../config.js";

// Pokušaj pljeske. events.onSlapContact(pljeskač, pogođeni) se zove pri pogotku guze.
export function trySlap(k, slapper, events) {
  if (slapper.slapCooldown > 0) return false;
  slapper.slapCooldown = JDT.slapCooldown;
  slapper.playLocked("slap", 0.22);

  const sensor = k.add([
    k.rect(JDT.slapReach, 16),
    k.opacity(0),
    k.pos(slapper.pos.add(slapper.facing * (7 + JDT.slapReach / 2), -12)),
    k.anchor("center"),
    k.area(),
    k.lifespan(0.1),
    "slapSensor",
    { owner: slapper },
  ]);
  sensor.onCollide("butt", (butt) => {
    if (butt.owner === slapper) return;
    events.onSlapContact(slapper, butt.owner);
    sensor.destroy();
  });
  return true;
}

// Tirkizni bljesak oko igrača kad pljeska "ne vrijedi".
export function shieldFlash(k, target) {
  const ring = k.add([
    k.circle(14),
    k.pos(target.pos.add(0, -12)),
    k.color(64, 216, 208),
    k.opacity(0.5),
    k.z(50),
    k.lifespan(0.25, { fade: 0.25 }),
  ]);
  ring.onUpdate(() => {
    ring.pos = target.pos.add(0, -12);
  });
}
