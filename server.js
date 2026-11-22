import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { registerFishing } from './fishing.js';

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
  // 낚시 기능을 현재 방과 플레이어에 연결합니다.
  const fishing = registerFishing(
    io,
    socket,
    room,
    {
      // 서버에 저장된 현재 플레이어 위치를 조회합니다.
      getPose: () => state.poses.get(socket.id),

      // 카페 의자에 앉아 있으면 낚시를 시작하지 못합니다.
      isSeated: () => seatedChair !== null,

      // 낚시 시작·종료 자세를 저장하고 친구들에게 전달합니다.
      publishPose: pose => {
        state.poses.set(socket.id, pose);
        socket.to(room).emit('pose', socket.id, pose);
      }
    }
  );

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
    // 낚시 의자와 카페 의자에 동시에 앉지 못하도록 합니다.
    if (fishing.getActive()) {
      answer({
        ok: false,
        reason: '먼저 낚시를 그만해 주세요.'
      });
      return;
    }

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
    // 낚시는 전용 종료 버튼으로만 끝냅니다.
    if (fishing.getActive()) {
      if (typeof reply === 'function') {
        reply({
          ok: false,
          reason: '낚시 그만하기 버튼을 눌러 주세요.'
        });
      }
      return;
    }

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

    // 낚시 중이면 접이식 의자를 편 위치를 사용합니다.
    const fishingPosition = fishing.getActive();

    // 카페 의자 또는 낚시 위치가 있으면 그 위치에 고정합니다.
    const fixedPosition = chair || fishingPosition;

    const nextPose = [
      fixedPosition
        ? fixedPosition.x
        : Math.max(-9, Math.min(9, x)),

      fixedPosition
        ? fixedPosition.z
        : Math.max(-11, Math.min(7, z)),

      fixedPosition
        ? fixedPosition.yaw
        : yaw,

      fixedPosition ? 1 : 0,

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