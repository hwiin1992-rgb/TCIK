import { randomInt } from 'node:crypto';
const fisherman = { x: -7, z: -5.5 };
const fishingRooms = new Map();
const fortunes = [
  {
    "category": "\ucd1d\uc6b4",
    "message": "\uc791\uc740 \uc990\uac70\uc6c0\uc744 \uc790\uc8fc \ubc1c\uacac\ud558\ub294 \ud55c \ud574\uc608\uc694. \uc624\ub298\uc758 \uc88b\uc740 \uc21c\uac04\uc744 \ubaa8\uc544 \ubcf4\uc138\uc694."
  },
  {
    "category": "\ucd1d\uc6b4",
    "message": "\uc0c8\ub85c\uc6b4 \ub3c4\uc804\uc5d0 \uc5b4\uc6b8\ub9ac\ub294 \ud55c \ud574\uc608\uc694. \uc791\uac8c \uc2dc\uc791\ud55c \uc77c\uc774 \ub73b\ubc16\uc758 \uc7ac\ubbf8\ub97c \uac00\uc838\uc62c \uac70\uc608\uc694."
  },
  {
    "category": "\ud559\uc5c5\u00b7\uc77c",
    "message": "\uafb8\uc900\ud568\uc774 \uac00\uc7a5 \ub4e0\ub4e0\ud55c \uc7a5\ube44\uc608\uc694. \uc624\ub298 \ud574\ub0b8 \uc791\uc740 \uc77c\uc744 \uc2a4\uc2a4\ub85c \uce6d\ucc2c\ud574 \uc8fc\uc138\uc694."
  },
  {
    "category": "\ud559\uc5c5\u00b7\uc77c",
    "message": "\ub9c9\ud78c \ubb38\uc81c\ub294 \uc7a0\uae50 \uc26c\uc5c8\ub2e4 \ubcf4\uba74 \ub2e4\ub974\uac8c \ubcf4\uc77c \uc218 \uc788\uc5b4\uc694. \uc5ec\uc720\ub3c4 \uc2e4\ub825\uc758 \uc77c\ubd80\uc608\uc694."
  },
  {
    "category": "\uae08\uc804",
    "message": "\uc791\uc740 \uc9c0\ucd9c\uc744 \ub3cc\uc544\ubcf4\uba74 \uc18c\uc911\ud55c \ubaa9\ud45c\uac00 \ub354 \uac00\uae4c\uc6cc\uc838\uc694. \ub098\ub97c \uc704\ud55c \uc800\ucd95\uc744 \uc2dc\uc791\ud574 \ubcf4\uc138\uc694."
  },
  {
    "category": "\uae08\uc804",
    "message": "\ucda9\ub3d9\ubcf4\ub2e4 \uacc4\ud68d\uc774 \ube5b\ub098\ub294 \ud55c \ud574\uc608\uc694. \uaf2d \ud544\uc694\ud55c \uac83\uc5d0 \uc4f0\ub294 \uae30\uc068\uc744 \ubc1c\uacac\ud574 \ubcf4\uc138\uc694."
  },
  {
    "category": "\uc778\uc5f0",
    "message": "\uba3c\uc800 \uac74\ub128 \ub2e4\uc815\ud55c \uc778\uc0ac\uac00 \uc88b\uc740 \ucd94\uc5b5\uc758 \uc2dc\uc791\uc774 \ub420 \uc218 \uc788\uc5b4\uc694."
  },
  {
    "category": "\uc778\uc5f0",
    "message": "\ud3b8\ud558\uac8c \uc6c3\uc744 \uc218 \uc788\ub294 \uc0ac\ub78c\ub4e4\uacfc \ubcf4\ub0b4\ub294 \uc2dc\uac04\uc774 \uc62c\ud574\uc758 \uc18c\uc911\ud55c \uc120\ubb3c\uc774\uc5d0\uc694."
  },
  {
    "category": "\ud589\uc6b4",
    "message": "\uc624\ub298\uc758 \ud589\uc6b4\uc740 \ub530\ub73b\ud55c \uc74c\ub8cc \ud55c \uc794\uacfc \uce5c\uad6c\uc758 \uc6c3\uc74c \uc18d\uc5d0 \uc228\uc5b4 \uc788\uc5b4\uc694."
  },
  {
    "category": "\ud589\uc6b4",
    "message": "\ucc9c\ucc9c\ud788 \uac00\ub3c4 \uad1c\ucc2e\uc544\uc694. \ub2f9\uc2e0\ub9cc\uc758 \uc18d\ub3c4\ub85c \uba4b\uc9c4 \ud55c \ud574\ub97c \ub9cc\ub4e4\uc5b4 \ubcf4\uc138\uc694."
  },
  {
    "category": "\ubaa8\uce74\uc758 \uc751\uc6d0",
    "message": "\uc798\ud558\uace0 \uc788\uc5b4\uc694. \uc9c0\uce5c \ub0a0\uc5d0\ub294 \ubcc4\uc774 \ub0b4\ub9ac\ub294 \uce74\ud398\uc5d0\uc11c \uc7a0\uae50 \uc26c\uc5b4 \uac00\uc138\uc694."
  },
  {
    "category": "\ubaa8\uce74\uc758 \uc751\uc6d0",
    "message": "\uc62c\ud574\ub3c4 \ud568\uaed8 \uc6c3\uc744 \uc77c\uc774 \ub9ce\uae30\ub97c! \uc0ac\ub791\ud574 \ubaa8\uce74\ub4e4\u2764"
  }
];
function findFishingPosition(pose) {
  if (!pose) return null;
  const [x, z] = pose;
  if (!Number.isFinite(x) || !Number.isFinite(z) || Math.abs(x) > 8.4 || z < -10.2 || z > -4.3) return null;
  const edges = [];
  if (z <= -9.8) edges.push({ distance: Math.abs(z + 10.85), yaw: 0 });
  if (x <= -7.9) edges.push({ distance: Math.abs(x + 8.95), yaw: Math.PI / 2 });
  if (x >= 7.9) edges.push({ distance: Math.abs(x - 8.95), yaw: -Math.PI / 2 });
  if (!edges.length) return null;
  edges.sort((a, b) => a.distance - b.distance);
  return { x, z, yaw: edges[0].yaw };
}
export function registerFishing(io, socket, room, { getPose, isSeated, publishPose }) {
  if (!fishingRooms.has(room)) fishingRooms.set(room, new Map());
  const players = fishingRooms.get(room);
  const mine = { rented: false, active: false, x: 0, z: 0, yaw: 0, biteAt: 0 };
  players.set(socket.id, mine);
  function snapshot() {
    return [...players].filter(([, p]) => p.active).map(([id, p]) => ({ id, x: p.x, z: p.z, yaw: p.yaw }));
  }
  function broadcast() { io.to(room).emit('fishing:state', snapshot()); }
  function answer(reply, result) { if (typeof reply === 'function') reply(result); }
  function nextBite() { mine.biteAt = Date.now() + randomInt(4500, 9001); }
  socket.emit('fishing:init', { fisherman, players: snapshot() });
  socket.on('fishing:rent', reply => {
    const pose = getPose();
    if (!pose || Math.hypot(pose[0] - fisherman.x, pose[1] - fisherman.z) > 1.8) {
      answer(reply, { ok: false, reason: "\ub09a\uc2dc\uafbc\uc5d0\uac8c \uc870\uae08 \ub354 \uac00\uae4c\uc774 \uac00 \uc8fc\uc138\uc694." }); return;
    }
    mine.rented = true;
    answer(reply, { ok: true, message: "\ub09a\uc2ef\ub300\uc640 \uc811\uc774\uc2dd \uc758\uc790\ub97c \ube4c\ub838\uc5b4\uc694." });
  });
  socket.on('fishing:start', reply => {
    if (!mine.rented) { answer(reply, { ok: false, reason: "\uba3c\uc800 \ub09a\uc2dc\uafbc\uc5d0\uac8c \uc7a5\ube44\ub97c \ube4c\ub824 \uc8fc\uc138\uc694." }); return; }
    if (mine.active || isSeated()) { answer(reply, { ok: false, reason: "\uba3c\uc800 \ud604\uc7ac \uc790\ub9ac\uc5d0\uc11c \uc77c\uc5b4\ub098 \uc8fc\uc138\uc694." }); return; }
    const position = findFishingPosition(getPose());
    if (!position) { answer(reply, { ok: false, reason: "\ub370\ud06c\uc758 \uc67c\ucabd\u00b7\uc815\uba74\u00b7\uc624\ub978\ucabd \ubc14\ub2e4 \ub09c\uac04 \uac00\uae4c\uc774\ub85c \uac00 \uc8fc\uc138\uc694." }); return; }
    Object.assign(mine, position, { active: true });
    nextBite();
    const pose = getPose();
    publishPose([mine.x, mine.z, mine.yaw, 1, pose[4]]);
    broadcast();
    answer(reply, { ok: true, position, waitMs: mine.biteAt - Date.now() });
  });
  socket.on('fishing:reel', reply => {
    if (!mine.active) { answer(reply, { ok: false, reason: "\uba3c\uc800 \ub09a\uc2dc\ub97c \uc2dc\uc791\ud574 \uc8fc\uc138\uc694." }); return; }
    if (Date.now() < mine.biteAt) {
      answer(reply, { ok: false, reason: "\uc544\uc9c1 \uc785\uc9c8\uc744 \uae30\ub2e4\ub9ac\ub294 \uc911\uc774\uc5d0\uc694.", waitMs: mine.biteAt - Date.now() }); return;
    }
    const fortune = fortunes[randomInt(fortunes.length)];
    nextBite();
    answer(reply, { ok: true, fortune, waitMs: mine.biteAt - Date.now(), disclaimer: "\uc7ac\ubbf8\ub85c \uc990\uae30\ub294 \uc2e0\ub144 \uc6b4\uc138\uc785\ub2c8\ub2e4." });
  });
  socket.on('fishing:stop', reply => {
    if (mine.active) {
      mine.active = false;
      mine.biteAt = 0;
      const pose = getPose();
      if (pose) publishPose([mine.x, mine.z, mine.yaw, 0, pose[4]]);
      broadcast();
    }
    answer(reply, { ok: true });
  });
  socket.on('disconnect', () => {
    players.delete(socket.id);
    broadcast();
    if (players.size === 0) fishingRooms.delete(room);
  });
  return { getActive() { return mine.active ? { x: mine.x, z: mine.z, yaw: mine.yaw } : null; } };
}
