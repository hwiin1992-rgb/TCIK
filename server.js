import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const http = createServer(app);
const io = new Server(http);

app.use(express.static('public'));
app.use('/three', express.static('node_modules/three/build'));

// 화면에 배치된 의자와 동일한 순서로 번호를 부여합니다.
const chairs = [];

const largeTables = [
  [3.8, 1.4],
  [5.75, 4.55],
  [-0.35, 4.85]
];

const smallTables = [
  [-6.65, 4.25],
  [-3.35, 4.45],
  [7.10, -1.42],
  [3.55, -1.65]
];

// 큰 테이블에는 의자가 다섯 개씩 있습니다.
for (const [x, z] of largeTables) {
  for (let i = 0; i < 5; i++) {
    const yaw = i * Math.PI * 2 / 5;
    const distance = i === 0 ? 1.13 : 1.12;

    chairs.push({
      id: chairs.length,
      x: x + Math.sin(yaw) * distance,
      z: z + Math.cos(yaw) * distance,
      yaw
    });
  }
}

// 작은 테이블에는 양옆으로 의자가 두 개씩 있습니다.
for (const [x, z] of smallTables) {
  for (const yaw of [Math.PI / 2, -Math.PI / 2]) {
    chairs.push({
      id: chairs.length,
      x: x + Math.sin(yaw) * 1.12,
      z: z + Math.cos(yaw) * 1.12,
      yaw
    });
  }
}

// 방마다 의자 점유 상태와 플레이어 위치를 따로 관리합니다.
const rooms = new Map();

io.on('connection', socket => {
  const room = String(socket.handshake.auth?.room || '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64);

  if (!room) {
    socket.disconnect(true);
    return;
  }

  if (!rooms.has(room)) {
    rooms.set(room, {
      occupied: new Map(),
      poses: new Map()
    });
  }

  const state = rooms.get(room);

  socket.join(room);

  let lastPoseAt = 0;
  let seatedChair = null;

  const occupancy = () =>
    [...state.occupied].map(([chairId, playerId]) => ({
      chairId,
      playerId
    }));

  function broadcastSeats() {
    io.to(room).emit('seats:state', occupancy());
  }

  function releaseChair() {
    if (seatedChair === null) return;

    if (state.occupied.get(seatedChair) === socket.id) {
      state.occupied.delete(seatedChair);
    }

    seatedChair = null;
    broadcastSeats();
  }

  // 새로 접속한 사람에게 기존 플레이어와 의자 정보를 보냅니다.
  for (const [id, pose] of state.poses) {
    socket.emit('pose', id, pose);
  }

  socket.emit('seats:init', {
    chairs,
    occupied: occupancy()
  });

  // 착석 요청은 서버에서 순서대로 확인합니다.
  socket.on('seat:request', (chairId, reply) => {
    const answer = typeof reply === 'function'
      ? reply
      : () => {};

    if (!Number.isInteger(chairId) || !chairs[chairId]) {
      answer({ ok: false, reason: '올바른 의자가 아니에요.' });
      return;
    }

    if (seatedChair !== null) {
      answer({ ok: false, reason: '먼저 자리에서 일어나 주세요.' });
      return;
    }

    if (state.occupied.has(chairId)) {
      answer({ ok: false, reason: '이미 다른 사람이 앉아 있어요.' });
      return;
    }

    const chair = chairs[chairId];
    const pose = state.poses.get(socket.id);

    if (
      !pose ||
      Math.hypot(pose[0] - chair.x, pose[1] - chair.z) > 1.25
    ) {
      answer({ ok: false, reason: '의자에 조금 더 가까이 가 주세요.' });
      return;
    }

    // 빈자리 확인 직후 점유하므로 동시에 두 명이 앉을 수 없습니다.
    state.occupied.set(chairId, socket.id);
    seatedChair = chairId;

    const seatedPose = [
      chair.x,
      chair.z,
      chair.yaw,
      1,
      pose[4]
    ];

    state.poses.set(socket.id, seatedPose);
    socket.to(room).emit('pose', socket.id, seatedPose);

    broadcastSeats();

    answer({
      ok: true,
      chair
    });
  });

  socket.on('seat:leave', reply => {
    releaseChair();

    const pose = state.poses.get(socket.id);

    if (pose) {
      const standingPose = [...pose];
      standingPose[3] = 0;

      state.poses.set(socket.id, standingPose);
      socket.to(room).emit('pose', socket.id, standingPose);
    }

    if (typeof reply === 'function') {
      reply({ ok: true });
    }
  });

  socket.on('pose', pose => {
    const now = Date.now();

    if (
      now - lastPoseAt < 45 ||
      !Array.isArray(pose) ||
      pose.length !== 5 ||
      !pose.every(Number.isFinite)
    ) return;

    lastPoseAt = now;

    const [x, z, yaw, , drink] = pose;
    const chair = seatedChair === null
      ? null
      : chairs[seatedChair];

    // 착석 여부와 위치는 서버에서 승인한 의자를 기준으로 합니다.
    const nextPose = [
      chair ? chair.x : Math.max(-9, Math.min(9, x)),
      chair ? chair.z : Math.max(-11, Math.min(7, z)),
      chair ? chair.yaw : yaw,
      chair ? 1 : 0,
      Number.isInteger(drink) && drink >= 0 && drink < 5
        ? drink
        : -1
    ];

    state.poses.set(socket.id, nextPose);
    socket.to(room).volatile.emit('pose', socket.id, nextPose);
  });

  socket.on('disconnect', () => {
    releaseChair();
    state.poses.delete(socket.id);
    socket.to(room).emit('bye', socket.id);

    if (state.poses.size === 0 && state.occupied.size === 0) {
      const members = io.sockets.adapter.rooms.get(room);

      if (!members || members.size === 0) {
        rooms.delete(room);
      }
    }
  });
});

http.listen(process.env.PORT || 3000);