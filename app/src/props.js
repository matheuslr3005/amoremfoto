import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TONES } from './photos.js';

// Objetos 3D da história, todos feitos de primitivas + texturas geradas em canvas (sem arquivos de modelo).
// Tudo em "unidades U" — a escala final é aplicada em gl.js.

const M = (o) => new THREE.MeshStandardMaterial(o);

// ───────────── texturas procedurais ─────────────
function canvasTex(w, h, draw, { repeat, srgb = false, aniso = 8 } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

// grão de couro sintético (bump)
const leatherBump = () =>
  canvasTex(
    128,
    128,
    (g, w, h) => {
      g.fillStyle = '#9a9a9a';
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1100; i++) {
        const v = 60 + Math.random() * 90;
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.beginPath();
        g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.6, 0, Math.PI * 2);
        g.fill();
      }
    },
    { repeat: [5, 3] },
  );

// serrilhado (anéis de foco / botões): uma faixa clara por repetição
const knurlBump = (n) =>
  canvasTex(
    8,
    8,
    (g, w, h) => {
      g.fillStyle = '#404040';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#e0e0e0';
      g.fillRect(2, 0, 4, h);
    },
    { repeat: [n, 1], aniso: 4 },
  );

// trama do tecido do rebatedor
const weaveBump = () =>
  canvasTex(
    32,
    32,
    (g, w, h) => {
      g.fillStyle = '#808080';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#b8b8b8';
      for (let i = 0; i < w; i += 4) g.fillRect(i, 0, 2, h);
      g.fillStyle = '#505050';
      for (let j = 0; j < h; j += 4) g.fillRect(0, j, w, 2);
    },
    { repeat: [46, 46] },
  );

// anel do diafragma com marcações
const tickMap = () =>
  canvasTex(
    512,
    64,
    (g, w, h) => {
      g.fillStyle = '#d4d2cd';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#1b1a19';
      for (let i = 0; i < 64; i++) {
        const x = (i / 64) * w;
        const big = i % 8 === 0;
        g.fillRect(x, h * 0.3, big ? 3 : 1.5, big ? h * 0.42 : h * 0.24);
      }
      g.font = '600 15px sans-serif';
      g.textAlign = 'center';
      ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16'].forEach((t, i) => g.fillText(t, (i / 8) * w + 22, h * 0.9));
    },
    { srgb: true },
  );

// texto gravado em volta do aro frontal da lente
function ringTextTex() {
  return canvasTex(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = '#141312';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8e6e0';
      g.font = '600 26px sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const txt = '1:1.4  50mm  ·  AMOR EM FOTO  ·  ';
      const R = 218;
      const step = (Math.PI * 2) / txt.length;
      for (let i = 0; i < txt.length; i++) {
        g.save();
        g.translate(w / 2, h / 2);
        g.rotate(i * step - Math.PI / 2);
        g.translate(0, -R);
        g.fillText(txt[i], 0, 0);
        g.restore();
      }
    },
    { srgb: true },
  );
}

// cilindro com eixo em +z e materiais [lateral, tampa, tampa]
function cyl(rTop, rBot, h, mats, z, seg = 64) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
  g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, mats);
  m.position.z = z;
  return m;
}

// ─────────────────────────────────────────────────────────────
// Câmera de filme (telêmetro). Frente = +z. Corpo: 2.4 de largura × ~1.5 de altura.
// ─────────────────────────────────────────────────────────────
export function buildCamera() {
  const g = new THREE.Group();

  const leather = M({ color: '#1e1b19', roughness: 0.72, bumpMap: leatherBump(), bumpScale: 1.4 });
  const chrome = M({ color: '#e2e2e0', metalness: 1, roughness: 0.2 });
  const satin = M({ color: '#cfcfcc', metalness: 1, roughness: 0.38 });
  const black = M({ color: '#151413', metalness: 0.5, roughness: 0.42 });
  const knurlBlack = M({ color: '#181716', metalness: 0.7, roughness: 0.42, bumpMap: knurlBump(64), bumpScale: 1.6 });
  const knurlChrome = M({ color: '#d8d8d5', metalness: 1, roughness: 0.3, bumpMap: knurlBump(44), bumpScale: 1.4 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#0a0c16',
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 1,
    iridescenceIOR: 1.7,
    iridescenceThicknessRange: [180, 520],
    envMapIntensity: 2.4,
  });
  const redDot = M({ color: '#b3392a', roughness: 0.25, metalness: 0.2 });

  const box = (w, h, d, r, mat, x, y, z) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // corpo em couro + placas cromadas
  box(2.4, 1.08, 0.62, 0.05, leather, 0, 0.0, 0);
  box(2.44, 0.27, 0.64, 0.05, chrome, 0, 0.66, 0);
  box(2.42, 0.1, 0.63, 0.04, satin, 0, -0.59, 0);

  // janelas do visor / telêmetro
  box(0.46, 0.25, 0.03, 0.04, satin, -0.78, 0.33, 0.31);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.16), glass);
  win.position.set(-0.78, 0.33, 0.328);
  g.add(win);
  box(0.2, 0.17, 0.03, 0.03, satin, -0.36, 0.34, 0.31);
  const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.1), glass);
  win2.position.set(-0.36, 0.34, 0.328);
  g.add(win2);

  // ponto vermelho
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), redDot);
  dot.position.set(0.93, 0.0, 0.312);
  g.add(dot);

  // anéis de alça
  for (const s of [-1, 1]) {
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.017, 10, 24), satin);
    lug.rotation.y = Math.PI / 2;
    lug.position.set(s * 1.24, 0.42, 0);
    g.add(lug);
  }

  // topo: disco de velocidades, alavanca e botão de disparo
  const top = (r, h, mats, x) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), mats);
    m.position.set(x, 0.8 + h / 2, 0);
    g.add(m);
    return m;
  };
  top(0.23, 0.12, [knurlChrome, satin, satin], 0.5);
  top(0.19, 0.08, [knurlChrome, satin, satin], -0.86);
  top(0.085, 0.1, [chrome, chrome, chrome], 0.92);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 10, 32), satin);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0.92, 0.82, 0);
  g.add(collar);
  box(0.4, 0.035, 0.2, 0.012, satin, -0.18, 0.82, 0); // sapata

  // ── lente ──
  const lens = new THREE.Group();
  lens.position.set(-0.02, -0.03, 0.31);
  lens.add(cyl(0.6, 0.6, 0.06, [satin, chrome, chrome], 0.03)); // baioneta
  lens.add(cyl(0.5, 0.5, 0.26, [knurlBlack, black, black], 0.19)); // anel de foco (serrilhado)
  lens.add(cyl(0.47, 0.47, 0.14, [new THREE.MeshStandardMaterial({ map: tickMap(), metalness: 0.9, roughness: 0.32 }), chrome, chrome], 0.39)); // diafragma
  lens.add(cyl(0.44, 0.46, 0.18, [black, black, black], 0.55)); // corpo frontal
  lens.add(cyl(0.455, 0.455, 0.035, [chrome, chrome, chrome], 0.655)); // aro cromado
  const txt = new THREE.Mesh(new THREE.RingGeometry(0.305, 0.43, 96), new THREE.MeshStandardMaterial({ map: ringTextTex(), roughness: 0.5, metalness: 0.4 }));
  txt.position.z = 0.6745;
  lens.add(txt);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.31, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  cap.rotation.x = Math.PI / 2;
  cap.scale.set(1, 0.22, 1);
  cap.position.z = 0.6;
  lens.add(cap);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#1a0f33', roughness: 0.05, clearcoat: 1, envMapIntensity: 1.6 }));
  inner.rotation.x = Math.PI / 2;
  inner.scale.set(1, 0.3, 1);
  inner.position.z = 0.655;
  lens.add(inner);
  const spec = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 }));
  spec.position.set(-0.13, 0.15, 0.7);
  lens.add(spec);
  g.add(lens);

  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.rotation.order = 'ZXY'; // roll → pitch → yaw
  return g;
}

// ─────────────────────────────────────────────────────────────
// Cena 01 · rebatedor (disco de tecido com aro flexível)
// eixo do disco = y local (a face de cima é onde a câmera desliza)
// ─────────────────────────────────────────────────────────────
export function buildReflector(R, T) {
  const g = new THREE.Group();
  const weave = weaveBump();
  const sheen = canvasTex(
    256,
    256,
    (c, w, h) => {
      const gr = c.createRadialGradient(w * 0.42, h * 0.4, 8, w / 2, h / 2, w * 0.62);
      gr.addColorStop(0, '#ffffff');
      gr.addColorStop(0.7, '#f1eee7');
      gr.addColorStop(1, '#dcd7cc');
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
    },
    { srgb: true },
  );
  const top = M({ color: '#ffffff', map: sheen, roughness: 0.95, bumpMap: weave, bumpScale: 0.7 });
  const side = M({ color: '#e9e5dc', roughness: 0.95 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.006, R - 0.006, T, 96), [side, top, top]);
  g.add(disc);

  // aro (nylon preto sobre aço)
  const nylon = M({ color: '#2e2a27', roughness: 0.82, bumpMap: weave, bumpScale: 0.5 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.011, 14, 140), nylon);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);

  // costura
  const thread = new THREE.Mesh(new THREE.TorusGeometry(R * 0.93, 0.0025, 6, 120), M({ color: '#bdb6a9', roughness: 0.9 }));
  thread.rotation.x = Math.PI / 2;
  thread.position.y = T / 2 + 0.0015;
  g.add(thread);

  // alça de mão (aba preta com velcro)
  const a = -Math.PI * 0.72;
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.028, 0.055, 2, 0.008), nylon);
  tab.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
  tab.rotation.y = -a;
  g.add(tab);

  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

// ─────────────────────────────────────────────────────────────
// Cena 02 · foto instantânea (papel + imagem que "revela")
// ─────────────────────────────────────────────────────────────
export function buildPrint(photoCanvas, w = 0.2) {
  const h = w * 1.22;
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.006, 2, 0.003), M({ color: '#f7f2e9', roughness: 0.6 }));
  paper.castShadow = paper.receiveShadow = true;
  g.add(paper);

  const tex = new THREE.CanvasTexture(photoCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.repeat.set(1, 0.8); // recorte quadrado da foto vertical
  tex.offset.set(0, 0.1);
  const pw = w * 0.86;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32, metalness: 0, emissive: new THREE.Color('#ece3d2'), emissiveIntensity: 0.9 });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(pw, pw), mat);
  photo.position.set(0, h / 2 - w * 0.07 - pw / 2, 0.0035);
  photo.receiveShadow = true;
  g.add(photo);
  g.userData.mat = mat;
  return g;
}

const DEV_FROM = new THREE.Color('#9a9484');
const DEV_TO = new THREE.Color('#ffffff');
// d = 0 (branca, "sem revelar") … 1 (revelada)
export function setDevelop(group, d) {
  const m = group.userData.mat;
  m.color.copy(DEV_FROM).lerp(DEV_TO, d);
  m.emissiveIntensity = (1 - d) * 0.95;
}

// ─────────────────────────────────────────────────────────────
// Cena 03 · tira de filme em espiral
// ─────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function filmTexture() {
  const W = 256;
  const P = 282; // passo entre fotogramas
  const N = 6;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = P * N;
  const g = c.getContext('2d');
  g.fillStyle = '#3d2e27';
  g.fillRect(0, 0, W, c.height);

  for (let f = 0; f < N; f++) {
    const y0 = f * P;
    const [lite, mid, deep] = TONES[(f * 5 + 1) % TONES.length];
    const fx = 40;
    const fw = 176;
    const fh = 118;
    const fy = y0 + (P - fh) / 2;
    g.save();
    rr(g, fx, fy, fw, fh, 6);
    g.clip();
    const gr = g.createLinearGradient(fx, fy, fx + fw, fy + fh);
    gr.addColorStop(0, lite);
    gr.addColorStop(0.55, mid);
    gr.addColorStop(1, deep);
    g.fillStyle = gr;
    g.fillRect(fx, fy, fw, fh);
    const blob = (cx, cy, rx, ry, c1, c2, a) => {
      g.save();
      g.translate(cx, cy);
      g.scale(rx, ry);
      const rg = g.createRadialGradient(-0.3, -0.4, 0.05, 0, 0, 1);
      rg.addColorStop(0, c1);
      rg.addColorStop(1, c2);
      g.globalAlpha = a;
      g.fillStyle = rg;
      g.beginPath();
      g.arc(0, 0, 1, 0, Math.PI * 2);
      g.fill();
      g.restore();
    };
    blob(fx + fw * 0.5, fy + fh * 0.78, fw * 0.62, fh * 0.3, lite, deep, 0.95);
    blob(fx + fw * 0.44, fy + fh * 0.66, fw * 0.4, fh * 0.2, '#ffffff', mid, 0.85);
    blob(fx + fw * (0.34 + (f % 3) * 0.06), fy + fh * 0.5, fh * 0.17, fh * 0.17, '#fff4e8', deep, 0.95);
    const bg = g.createLinearGradient(fx + fw * 0.2, fy, fx + fw * 0.55, fy);
    bg.addColorStop(0, 'rgba(255,255,255,0)');
    bg.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    bg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = bg;
    g.fillRect(fx, fy, fw, fh);
    g.restore();

    g.save();
    g.fillStyle = '#e9a25f';
    g.font = '600 9px sans-serif';
    g.textAlign = 'center';
    g.translate(33, y0 + P / 2);
    g.rotate(-Math.PI / 2);
    g.fillText('AMOR EM FOTO  ▸  ' + (f * 2 + 1), 0, 0);
    g.restore();
    g.save();
    g.fillStyle = '#e9a25f';
    g.font = '600 10px sans-serif';
    g.textAlign = 'center';
    g.translate(224, y0 + P / 2);
    g.rotate(-Math.PI / 2);
    g.fillText(f + 1 + 'A', 0, 0);
    g.restore();
  }

  // perfurações recortadas (transparentes)
  g.globalCompositeOperation = 'destination-out';
  for (let y = 18; y < c.height; y += P / 4) {
    for (const x of [11, 227]) {
      rr(g, x, y, 18, 30, 6);
      g.fill();
    }
  }
  g.globalCompositeOperation = 'source-over';

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// fita ao longo da curva, com a face sempre voltada para a câmera (+z)
export function buildFilmStrip(curve, segs, width, frames) {
  const tex = filmTexture();
  const pos = [];
  const nor = [];
  const uv = [];
  const idx = [];
  const T = new THREE.Vector3();
  const d = new THREE.Vector3();
  const e = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const P = curve.getPointAt(t);
    curve.getTangentAt(t, T);
    d.set(P.x * 3.2, 0, 1).normalize();
    d.addScaledVector(T, -d.dot(T)).normalize();
    e.crossVectors(T, d).normalize();
    for (const s of [-1, 1]) {
      pos.push(P.x + e.x * width * 0.5 * s, P.y + e.y * width * 0.5 * s, P.z + e.z * width * 0.5 * s);
      nor.push(d.x, d.y, d.z);
      uv.push(s < 0 ? 0 : 1, t * (frames / 6));
    }
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: tex,
    emissiveIntensity: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─────────────────────────────────────────────────────────────
// Cartão de memória SD – final da história
// ─────────────────────────────────────────────────────────────
function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 360;
  c.height = 300;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    const g = c.getContext('2d');
    g.fillStyle = '#2f343c';
    g.fillRect(0, 0, c.width, c.height);
    // faixa de acento
    g.fillStyle = '#b5573a';
    g.fillRect(0, 0, c.width, 14);
    g.fillStyle = '#f2eee6';
    g.textAlign = 'left';
    g.font = 'italic 300 40px "Fraunces Variable", Georgia, serif';
    g.fillText('amor em foto', 24, 78);
    g.textAlign = 'right';
    g.font = '800 92px "Manrope Variable", system-ui, sans-serif';
    g.fillText('128', 250, 190);
    g.font = '800 34px "Manrope Variable", system-ui, sans-serif';
    g.fillText('GB', 322, 190);
    g.textAlign = 'left';
    g.font = '700 22px "Manrope Variable", system-ui, sans-serif';
    g.fillStyle = 'rgba(242,238,230,0.85)';
    g.fillText('SDXC', 24, 250);
    g.fillText('UHS-I', 104, 250);
    g.strokeStyle = 'rgba(242,238,230,0.85)';
    g.lineWidth = 3;
    rr(g, 200, 226, 52, 32, 6);
    g.stroke();
    g.font = '800 20px "Manrope Variable", system-ui, sans-serif';
    g.fillText('U3', 213, 250);
    rr(g, 264, 226, 60, 32, 6);
    g.stroke();
    g.fillText('V30', 274, 250);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('italic 300 40px "Fraunces Variable"').then(draw).catch(() => {});
  document.fonts?.load('800 92px "Manrope Variable"').then(draw).catch(() => {});
  return tex;
}

export function buildMemoryCard() {
  const W = 0.36;
  const H = 0.47;
  const C = 0.08; // canto cortado
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, -H / 2);
  shape.lineTo(W / 2, -H / 2);
  shape.lineTo(W / 2, H / 2 - C);
  shape.lineTo(W / 2 - C, H / 2);
  shape.lineTo(-W / 2, H / 2);
  shape.closePath();
  const depth = 0.03;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  const plastic = M({ color: '#2b2f36', roughness: 0.48 });
  const body = new THREE.Mesh(geo, [plastic, plastic]);

  const g = new THREE.Group();
  g.add(body);

  const label = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.9, H * 0.6), new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.42 }));
  label.position.set(0, 0.06, depth / 2 + 0.0065);
  g.add(label);

  const gold = M({ color: '#d9b96e', roughness: 0.28, metalness: 1 });
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.003), gold);
    p.position.set(-W / 2 + 0.05 + i * ((W - 0.1) / 7), -H / 2 + 0.055, depth / 2 + 0.0065);
    g.add(p);
  }
  const sw = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.02), M({ color: '#8b9099', roughness: 0.5 }));
  sw.position.set(-W / 2 - 0.004, 0.12, 0);
  g.add(sw);

  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}
