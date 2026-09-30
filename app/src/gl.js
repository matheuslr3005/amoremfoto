import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildCamera, buildReflector, buildLensGeometry, buildFilmStrip, buildMemoryCard, LENS_R } from './props.js';
import { sampleMood } from './mood.js';
import { stageAt, clamp, lerp, smooth, easeInOutCubic, easeOutCubic, camAtMove } from './timeline.js';

const D = 30; // distância da câmera
const FOV = 30;
const VH_WORLD = 2 * D * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // altura visível em z=0

// ---------- medidas em "unidades U" (U = tamanho de referência da cena) ----------
const BALL_R = 0.058; // "raio" de referência da câmera que viaja (largura do corpo = 2.4 × isto)
const CAM_BOTTOM = 0.8; // metade da altura da câmera (em BALL_R) – onde ela toca as superfícies
const HERO_SCALE = 2.3;

const RAMP_L = 0.56; // diâmetro do rebatedor
const RAMP_T = 0.05;
const RAMP_TILT = 0.5; // giro do disco em torno do eixo longo (mostra a face de cima)
const RAMP_TH = -0.62;

const PIN_ROWS = 6;
const PIN_COLS = 5;
const PIN_SX = 0.135;
const PIN_SY = 0.118;
const PIN_R = LENS_R;
const HITS = [
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 2],
  [4, 2],
  [5, 1],
];

const HELIX_R = 0.14;
const HELIX_TURNS = 2;
const HELIX_TOP = 0.34;
const HELIX_BOT = -0.13;
const FILM_W = 0.15;
const NEST_S = 0.7; // escala do cartão de memória

function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 200);
  camera.position.set(0, 0, D);

  // ---------- luzes ----------
  const key = new THREE.DirectionalLight('#fff0da', 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 9;
  key.shadow.blurSamples = 18;
  key.shadow.bias = -0.0004;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 90;
  scene.add(key, key.target);

  const hemi = new THREE.HemisphereLight('#fff6ea', '#e6c8ab', 0.7);
  scene.add(hemi);

  // parede que só recebe sombra (o fundo real é o gradiente CSS)
  const wallMat = new THREE.ShadowMaterial({ color: '#5a3a28', opacity: 0.22 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat);
  wall.receiveShadow = true;
  scene.add(wall);

  // ---------- materiais ----------
  const lensMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.38, metalness: 0.2 });

  // ---------- cena 1 · rebatedor de luz ----------
  const gRamp = new THREE.Group();
  {
    const reflector = buildReflector(RAMP_L / 2, RAMP_T);
    reflector.rotation.x = RAMP_TILT;
    gRamp.add(reflector);
    gRamp.rotation.z = RAMP_TH;
  }
  scene.add(gRamp);

  // ---------- cena 2 · pinos ----------
  const gPins = new THREE.Group();
  const pinCount = PIN_ROWS * PIN_COLS;
  const pins = new THREE.InstancedMesh(buildLensGeometry(), lensMat, pinCount);
  pins.castShadow = true;
  pins.receiveShadow = true;
  pins.frustumCulled = false;
  const pinBase = [];
  {
    const cA = new THREE.Color('#f1c3ac');
    const cB = new THREE.Color('#f7eddf');
    const cC = new THREE.Color('#cdbdae');
    const tmp = new THREE.Color();
    for (let r = 0; r < PIN_ROWS; r++) {
      for (let c = 0; c < PIN_COLS; c++) {
        const i = r * PIN_COLS + c;
        const x = (c - 2) * PIN_SX + (r % 2 ? PIN_SX * 0.5 : 0) - PIN_SX * 0.25;
        const y = ((PIN_ROWS - 1) / 2 - r) * PIN_SY;
        pinBase.push({ x, y, tx: 0, ty: 0, s: 1, len: 0.85 + ((r * 7 + c * 13) % 5) * 0.1 });
        const t = r / (PIN_ROWS - 1);
        tmp.copy(t < 0.5 ? cA.clone().lerp(cB, t * 2) : cB.clone().lerp(cC, (t - 0.5) * 2));
        pins.setColorAt(i, tmp);
      }
    }
  }
  gPins.add(pins);
  scene.add(gPins);

  // ---------- cena 3 · hélice + ninho ----------
  const gHelix = new THREE.Group();
  const helixPts = [];
  const HN = 260;
  for (let i = 0; i <= HN; i++) {
    const s = i / HN;
    const th = Math.PI / 2 - s * HELIX_TURNS * Math.PI * 2;
    helixPts.push(new THREE.Vector3(HELIX_R * Math.cos(th), lerp(HELIX_TOP, HELIX_BOT, s), HELIX_R * Math.sin(th)));
  }
  const helixCurve = new THREE.CatmullRomCurve3(helixPts, false, 'catmullrom', 0.5);
  gHelix.add(buildFilmStrip(helixCurve, 520, FILM_W, 9));
  scene.add(gHelix);

  // cartão de memória no final da tira
  const gNest = new THREE.Group();
  {
    const pivot = new THREE.Group();
    pivot.add(buildMemoryCard());
    pivot.rotation.set(-0.95, 0, 0.1);
    gNest.add(pivot);
  }
  scene.add(gNest);

  // ---------- a câmera que viaja pela história ----------
  const cam = buildCamera();
  scene.add(cam);

  // ---------- poeira de luz ----------
  const dustTex = radialTexture([
    [0, 'rgba(255,255,255,1)'],
    [0.4, 'rgba(255,255,255,0.5)'],
    [1, 'rgba(255,255,255,0)'],
  ], 64);
  function makeDust(n, size, opacity) {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(n * 3);
    const seed = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      seed[i * 3] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ map: dustTex, size, sizeAttenuation: true, transparent: true, depthWrite: false, opacity, color: '#fffaf0' });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return { pts, arr, seed, n, mat };
  }
  const dustA = makeDust(70, 0.5, 0.75);
  const dustB = makeDust(22, 1.6, 0.35);
  scene.add(dustA.pts, dustB.pts);

  // ---------- estado ----------
  const L = { VW: 1, VH: VH_WORLD, U: 1, UH: 1, portrait: false, w: 1, h: 1 };
  const pos = {
    hero: new THREE.Vector3(),
    rampStart: new THREE.Vector3(),
    rampEnd: new THREE.Vector3(),
    pinHits: HITS.map(() => new THREE.Vector3()),
    pinEntry: new THREE.Vector3(),
    helixStart: new THREE.Vector3(),
    helixEnd: new THREE.Vector3(),
    nest: new THREE.Vector3(),
  };
  const state = {
    mood: 1,
    intro: 0,
    pointer: { x: 0, y: 0, sx: 0, sy: 0, wx: 0, wy: 0, inside: false },
    active: true,
    camT: 0,
    camY: 0,
  };
  const moodOut = {};
  const P = new THREE.Vector3();
  const ballWorld = new THREE.Vector3(); // posição da câmera que viaja (empurra as lentes)
  const pose = { roll: 0, yaw: 0, pitch: 0 };
  let nowT = 0;

  function layout(w, h) {
    L.w = w;
    L.h = h;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    L.VH = VH_WORLD;
    L.VW = VH_WORLD * aspect;
    L.portrait = aspect < 0.95;
    L.U = L.portrait ? L.VW * 0.95 : Math.min(L.VH, L.VW * 0.62);
    L.UH = L.portrait ? L.U * 1.25 : L.U; // hélice/ninho um pouco maiores no celular
    const { VW, VH, U, UH } = L;
    const cy = L.portrait ? 0.15 * VH : 0;
    const cx = (f) => (L.portrait ? 0 : f * VW);

    pos.hero.set(L.portrait ? 0 : 0.2 * VW, L.portrait ? 0.17 * VH : 0.03 * VH, 0.2 * U);

    gRamp.position.set(cx(-0.06), -1 * VH + cy + 0.03 * VH, 0);
    gRamp.scale.setScalar(U);
    gPins.position.set(cx(0.14), -2 * VH + cy, 0);
    gPins.scale.setScalar(U);
    gHelix.position.set(cx(-0.12), -3 * VH + cy + 0.07 * VH, 0);
    gHelix.scale.setScalar(UH);

    // pontos-chave (mundo)
    const c = Math.cos(RAMP_TH);
    const s = Math.sin(RAMP_TH);
    const rampPt = (xl, out) => {
      // superfície de cima da placa (girada em RAMP_TILT) + raio da esfera
      const ly = RAMP_T / 2 + BALL_R * CAM_BOTTOM;
      const oy = ly * Math.cos(RAMP_TILT);
      const oz = ly * Math.sin(RAMP_TILT);
      out.set(gRamp.position.x + U * (xl * c - oy * s), gRamp.position.y + U * (xl * s + oy * c), U * oz);
    };
    rampPt(-RAMP_L * 0.5 * 0.86, pos.rampStart);
    rampPt(RAMP_L * 0.5 * 0.97, pos.rampEnd);

    HITS.forEach(([r, col], i) => {
      const b = pinBase[r * PIN_COLS + col];
      pos.pinHits[i].set(gPins.position.x + U * b.x, gPins.position.y + U * (b.y + PIN_R + BALL_R * CAM_BOTTOM), U * 0.05);
    });
    pos.pinEntry.copy(pos.pinHits[0]);
    pos.pinEntry.y += U * 0.22;

    const hs = helixCurve.getPointAt(0);
    const he = helixCurve.getPointAt(1);
    pos.helixStart.set(gHelix.position.x + UH * hs.x, gHelix.position.y + UH * hs.y, UH * hs.z);
    pos.helixEnd.set(gHelix.position.x + UH * he.x, gHelix.position.y + UH * he.y, UH * he.z);
    gNest.position.set(pos.helixEnd.x, pos.helixEnd.y - UH * 0.15, UH * 0.1);
    gNest.scale.setScalar(UH * NEST_S);
    // a câmera pousa na parte de baixo do cartão, deixando o rótulo aparecer
    pos.nest.set(gNest.position.x - UH * 0.03, gNest.position.y + UH * (0.02 + BALL_R * CAM_BOTTOM - 0.05), gNest.position.z + UH * 0.09);

    // parede de sombra
    const wallZ = -0.33 * U;
    const k = (D - wallZ) / D;
    wall.position.z = wallZ;
    wall.scale.set(VW * 1.7 * k, VH * 1.7 * k, 1);

    // câmera de sombra cobre a tela
    const sc = key.shadow.camera;
    const ext = Math.max(VW, VH) * 0.85;
    sc.left = -ext;
    sc.right = ext;
    sc.top = ext;
    sc.bottom = -ext;
    sc.updateProjectionMatrix();

    dustA.pts.scale.set(1, 1, 1);
    dustA.mat.size = 0.34 * (VH / VH_WORLD) * Math.max(0.8, U / VH);
    dustB.mat.size = 1.4 * Math.max(0.8, U / VH);
  }

  function resize(w, h, dpr) {
    renderer.setPixelRatio(Math.min(dpr || 1, 2));
    renderer.setSize(w, h, false);
    layout(w, h);
  }

  // ---------- trajetória da esfera ----------
  const EXIT = [
    { dx: 0, dy: 0, v: 0 },
    { dx: Math.cos(RAMP_TH), dy: Math.sin(RAMP_TH), v: 0.12 },
    { dx: -0.6, dy: -0.8, v: 0.1 },
  ];

  const ptrX = () => state.pointer.sx;

  // posição (mundo) + pose da câmera em cada momento da cena k (u = 0..1)
  function actionPos(k, u, out) {
    const { U } = L;
    pose.roll = 0;
    pose.yaw = ptrX() * 0.3;
    pose.pitch = 0;
    if (k === 1) {
      const hold = 0.12;
      const t = Math.pow(clamp((u - hold) / (1 - hold)), 1.8);
      out.lerpVectors(pos.rampStart, pos.rampEnd, t);
      // desliza pelo rebatedor, acompanhando a inclinação
      pose.roll = RAMP_TH * 0.92 + Math.sin(nowT * 5) * 0.012 * t;
      pose.yaw = 0.3 + ptrX() * 0.2;
      pose.pitch = -0.06;
    } else if (k === 2) {
      const n = HITS.length;
      const f = u * n; // segmento 0 = queda de entrada
      if (f < 1) {
        const t = f * f;
        out.lerpVectors(pos.pinEntry, pos.pinHits[0], t);
        pose.roll = (1 - t) * 0.25;
      } else {
        const i = Math.min(n - 2, Math.floor(f - 1));
        const t = f - 1 - i;
        out.lerpVectors(pos.pinHits[i], pos.pinHits[i + 1], t);
        out.y += U * 0.06 * 4 * t * (1 - t);
        // gira um pouquinho a cada pulo, na direção do movimento
        const dir = Math.sign(pos.pinHits[i + 1].x - pos.pinHits[i].x) || 1;
        pose.roll = -dir * 0.55 * Math.sin(Math.PI * t);
        pose.yaw = -dir * 0.25 * Math.sin(Math.PI * t) + ptrX() * 0.2;
        if (u >= 1) {
          out.copy(pos.pinHits[n - 1]);
          pose.roll = 0;
        }
      }
    } else if (k === 3) {
      const run = 0.86;
      if (u < run) {
        const hold = 0.06;
        let t = clamp((u - hold) / (run - hold));
        t = t * t * (3 - 2 * t) * 0.65 + t * 0.35;
        const hp = helixCurve.getPointAt(t);
        const tg = helixCurve.getTangentAt(t);
        // a câmera anda sobre a tira de filme (face da tira aponta para +z)
        out.set(gHelix.position.x + L.UH * hp.x, gHelix.position.y + L.UH * hp.y, L.UH * hp.z + BALL_R * L.UH * 0.5);
        pose.roll = -0.7 * Math.tanh(tg.x * 4);
        pose.yaw = tg.x * 0.4 + ptrX() * 0.15;
        pose.pitch = 0.05;
      } else {
        const t = (u - run) / (1 - run);
        const e = t * t;
        out.lerpVectors(pos.helixEnd, pos.nest, e);
        out.y += U * 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.4)) * (1 - t) * 0.6;
        pose.roll = 0;
        pose.yaw = ptrX() * 0.3;
        pose.pitch = -0.05 * t;
      }
    } else {
      out.copy(pos.hero);
    }
    return out;
  }

  const landing = (v) => {
    const k = 0.78;
    if (v < k) {
      const a = v / k;
      return a * a;
    }
    const b = (v - k) / (1 - k);
    return 1 - 0.07 * Math.sin(Math.PI * b) * (1 - b * 0.3);
  };

  const A = new THREE.Vector3();
  const B = new THREE.Vector3();

  const poseA = { roll: 0, yaw: 0, pitch: 0 };
  const poseB = { roll: 0, yaw: 0, pitch: 0 };
  const heroPose = (out, time) => {
    const ptr = state.pointer;
    // a lente acompanha o cursor
    out.roll = Math.sin(time * 0.9) * 0.04;
    out.yaw = ptr.sx * 0.6 + Math.sin(time * 0.7) * 0.08;
    out.pitch = -ptr.sy * 0.38;
  };

  function placeCamera(st, time) {
    const { VW, VH, U } = L;
    let sc = 1;
    let visible = true;
    const ptr = state.pointer;
    nowT = time;

    if (st.kind === 'hold') {
      P.copy(pos.hero);
      P.x += ptr.sx * 0.03 * VW;
      P.y += ptr.sy * 0.03 * VH + Math.sin(time * 1.1) * 0.012 * VH;
      sc = HERO_SCALE * (1 + Math.sin(time * 1.6) * 0.012);
      heroPose(pose, time);
    } else if (st.kind === 'act') {
      actionPos(st.scene, st.u, P);
    } else {
      const j = st.from;
      const u = st.u;
      const split1 = 0.46;
      const split2 = 0.52;
      const scale1 = j === 0 ? lerp(HERO_SCALE, 1, smooth(0, split1, u)) : 1;
      const r1 = BALL_R * U * scale1;
      if (u < split1) {
        // queda para fora da tela, girando
        if (j === 0) {
          A.copy(pos.hero);
          heroPose(poseA, time);
        } else {
          actionPos(j, 1, A);
          Object.assign(poseA, pose);
        }
        const ex = EXIT[j];
        const vx = ex.dx * ex.v * U;
        const vy = ex.dy * ex.v * U;
        const u1 = u / split1;
        const camEnd = -(j + easeInOutCubic(split1)) * VH;
        const yT = camEnd - VH / 2 - 3.6 * r1;
        const g = A.y + vy - yT;
        P.set(A.x + vx * u1, A.y + vy * u1 - g * u1 * u1, A.z);
        sc = scale1;
        pose.roll = poseA.roll - u1 * u1 * 4.6;
        pose.yaw = poseA.yaw * (1 - u1);
        pose.pitch = poseA.pitch * (1 - u1);
      } else if (u < split2) {
        visible = false;
        P.set(0, -j * VH, 0);
      } else {
        // entra por cima na próxima cena e "pousa"
        const v = (u - split2) / (1 - split2);
        actionPos(j + 1, 0, B);
        Object.assign(poseB, pose);
        const camNow = camAtMove(j, j + 1, u) * -VH;
        const camEnd = -(j + 1) * VH;
        const startLocal = VH / 2 + 3.6 * BALL_R * U;
        const targetLocal = B.y - camEnd;
        const f = landing(v);
        const side = (B.x >= 0 ? -1 : 1) * 0.07 * VW * (1 - easeOutCubic(v));
        P.set(B.x + side, camNow + lerp(startLocal, targetLocal, f), B.z);
        const k = 1 - easeOutCubic(v);
        pose.roll = poseB.roll + k * 3.4;
        pose.yaw = poseB.yaw;
        pose.pitch = poseB.pitch;
        sc = 1;
      }
    }

    // entrada inicial (intro): a câmera surge girando
    const intro = state.intro;
    const ie = easeOutCubic(intro);
    cam.visible = visible && intro > 0.001;
    const r = BALL_R * U * sc * (0.2 + 0.8 * ie);
    cam.position.copy(P);
    cam.scale.setScalar(r);
    cam.rotation.set(pose.pitch, pose.yaw, pose.roll + (1 - ie) * -2.4);
    ballWorld.copy(P);
  }

  // ---------- lentes reagem ao cursor e à câmera ----------
  const dummy = new THREE.Object3D();
  const vTilt = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const q = new THREE.Quaternion();

  function updatePins(time, dt) {
    const { U } = L;
    const ptr = state.pointer;
    const near = Math.abs(state.camT - 2) < 1.05;
    if (!near) return;
    const k = 1 - Math.exp(-dt * 9);
    for (let i = 0; i < pinCount; i++) {
      const b = pinBase[i];
      const wx = gPins.position.x + U * b.x;
      const wy = gPins.position.y + U * b.y;

      // cursor: a lente se vira para olhar o cursor
      let dx = ptr.wx - wx;
      let dy = ptr.wy - wy;
      let dist = Math.hypot(dx, dy) || 1e-4;
      const fc = ptr.inside ? Math.exp(-Math.pow(dist / (0.3 * U), 2)) : 0;
      let tx = (dx / dist) * fc * 0.95;
      let ty = (dy / dist) * fc * 0.95;

      // câmera: empurra as lentes para longe quando passa perto
      dx = ballWorld.x - wx;
      dy = ballWorld.y - wy;
      dist = Math.hypot(dx, dy) || 1e-4;
      const fb = Math.exp(-Math.pow(dist / (0.16 * U), 2));
      tx -= (dx / dist) * fb * 0.8;
      ty -= (dy / dist) * fb * 0.8;

      // respiração suave
      tx += Math.sin(time * 0.9 + i * 0.7) * 0.06;
      ty += Math.cos(time * 0.8 + i * 1.1) * 0.06;

      b.tx += (tx - b.tx) * k;
      b.ty += (ty - b.ty) * k;
      b.s += (1 + fc * 0.16 - b.s) * k;

      vTilt.set(b.tx, b.ty, 1).normalize();
      q.setFromUnitVectors(zAxis, vTilt);
      dummy.position.set(b.x, b.y, 0);
      dummy.quaternion.copy(q);
      dummy.scale.set(b.s, b.s, b.s * b.len);
      dummy.updateMatrix();
      pins.setMatrixAt(i, dummy.matrix);
    }
    pins.instanceMatrix.needsUpdate = true;
  }

  // ---------- poeira ----------
  function updateDust(dust, time, depthK) {
    const { VW, VH, U } = L;
    const a = dust.arr;
    for (let i = 0; i < dust.n; i++) {
      const s0 = dust.seed[i * 3];
      const s1 = dust.seed[i * 3 + 1];
      const s2 = dust.seed[i * 3 + 2];
      const t = time * (0.012 + s2 * 0.02);
      const x = ((s0 + t * 0.6 + Math.sin(time * 0.2 + s1 * 9) * 0.02) % 1 + 1) % 1;
      const y = ((s1 - t + 1000) % 1 + 1) % 1;
      a[i * 3] = (x - 0.5) * VW * 1.3;
      a[i * 3 + 1] = (y - 0.5) * VH * 1.3;
      a[i * 3 + 2] = (s2 - 0.35) * U * depthK;
    }
    dust.pts.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- frame ----------
  let last = 0;

  function render(p, time) {
    const dt = Math.min(0.05, time - last || 0.016);
    last = time;
    const { VW, VH, U } = L;

    const st = stageAt(p);
    state.camT = st.camT;
    const camY = -st.camT * VH;
    state.camY = camY;

    // ponteiro suavizado
    const ptr = state.pointer;
    const pk = 1 - Math.exp(-dt * 5);
    ptr.sx += (ptr.x - ptr.sx) * pk;
    ptr.sy += (ptr.y - ptr.sy) * pk;
    ptr.wx = ptr.x * VW * 0.5;
    ptr.wy = camY + ptr.y * VH * 0.5;

    // câmera orbita levemente com o mouse (paralaxe 3D real)
    camera.position.set(ptr.sx * 1.4, camY + ptr.sy * 0.9, D);
    camera.lookAt(0, camY, 0);

    // mood
    const m = sampleMood(state.mood, moodOut);
    key.color.copy(m.light);
    key.intensity = m.key;
    key.position.set(m.dirX * 60, camY + m.dirY * 60, 60);
    key.target.position.set(0, camY, 0);
    hemi.intensity = m.hemi;
    hemi.color.copy(m.light);
    scene.environmentIntensity = m.env;
    wallMat.color.copy(m.shadow);
    wallMat.opacity = m.shadowOp;
    wall.position.x = 0;
    wall.position.y = camY;

    // flutuação sutil do rebatedor
    gRamp.children[0].position.y = Math.sin(time * 0.8) * 0.004;

    placeCamera(st, time);
    updatePins(time, dt);

    dustA.pts.position.set(0, camY, 0);
    dustB.pts.position.set(0, camY, 0);
    updateDust(dustA, time, 0.9);
    updateDust(dustB, time * 0.6, 1.6);

    renderer.render(scene, camera);
  }

  return {
    render,
    resize,
    state,
    dbg: { scene, gRamp, gPins, gHelix, gNest, cam, dustA, dustB, wall, key },
    setMood(m) {
      state.mood = m;
    },
    getMoodCss() {
      return sampleMood(state.mood, moodOut).css;
    },
    setIntro(v) {
      state.intro = v;
    },
    setPointer(x, y, inside = true) {
      state.pointer.x = x;
      state.pointer.y = y;
      state.pointer.inside = inside;
    },
    dispose() {
      renderer.dispose();
    },
  };
}
